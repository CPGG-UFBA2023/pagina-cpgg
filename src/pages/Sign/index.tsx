import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "../../hooks/use-toast";
import { HomeButton } from "../../components/HomeButton";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "./sign.module.css";
import { Button } from "@/components/ui/button";
import { createRecoveryRequest, recoveryErrorMessage } from "@/lib/passwordRecovery";
const logocpgg = "https://i.imgur.com/6HRTVzo.png";

// Site key do reCAPTCHA - esta é uma chave pública
const RECAPTCHA_SITE_KEY = "6Lc_tCcsAAAAANaPjNTNCehs44DT3dPVbUJao07b";

// Schema de validação
const registrationSchema = z
  .object({
    fullName: z.string().trim().min(1, "Nome completo é obrigatório").max(255),
    email: z.string().trim().email("Email inválido").max(255),
    phone: z.string().trim().min(1, "Telefone é obrigatório").max(20),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export function Sign() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isTechnician, setIsTechnician] = useState(false);
  const [labs, setLabs] = useState<{ id: string; name: string; acronym: string }[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string>("");
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recoverySent, setRecoverySent] = useState(false);
  const recoveryRequest = useRef(createRecoveryRequest((email, options) => supabase.auth.resetPasswordForEmail(email, options)));

  const navigate = useNavigate();
  const { toast } = useToast();

  const verifyCaptcha = async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-recaptcha", {
        body: { token },
      });

      if (error) {
        console.error("Error verifying captcha:", error);
        return false;
      }

      return data?.success === true;
    } catch (err) {
      console.error("Error calling verify-recaptcha:", err);
      return false;
    }
  };

  // Force remove scroll on mount
  useEffect(() => {
    // Save original styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalHtmlHeight = document.documentElement.style.height;

    // Apply no-scroll styles
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.maxHeight = "100vh";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100vh";
    document.documentElement.style.maxHeight = "100vh";

    // Restore on unmount
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.height = originalBodyHeight;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.height = originalHtmlHeight;
    };
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Redirect only after a successful sign in event
      if (event === "SIGNED_IN" && session?.user) {
        navigate("/");
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Buscar laboratórios para o formulário de técnico
  const fetchLabs = async () => {
    setIsLoadingLabs(true);
    try {
      const { data, error } = await supabase
        .from("laboratories")
        .select("id, name, acronym")
        .order("name", { ascending: true });

      if (error) {
        console.error("Erro ao buscar laboratórios:", error);
        return;
      }

      setLabs(data || []);
    } catch (err) {
      console.error("Erro inesperado ao buscar laboratórios:", err);
    } finally {
      setIsLoadingLabs(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  // Função para verificar se o nome foi pré-cadastrado pelo administrador
  const checkPreRegisteredName = async (fullName: string) => {
    const { data, error } = await supabase.rpc("find_user_profile_by_name", {
      _search_name: fullName.trim(),
    });

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verificar reCAPTCHA
      if (!captchaToken) {
        toast({
          title: "Verificação necessária",
          description: 'Por favor, complete a verificação "Não sou um robô".',
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Verificar token no servidor
      const isValidCaptcha = await verifyCaptcha(captchaToken);
      if (!isValidCaptcha) {
        toast({
          title: "Verificação falhou",
          description: "A verificação de segurança falhou. Tente novamente.",
          variant: "destructive",
        });
        recaptchaRef.current?.reset();
        setCaptchaToken(null);
        setIsLoading(false);
        return;
      }

      // Validar dados do formulário
      const validationResult = registrationSchema.safeParse(formData);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Erro de validação",
          description: firstError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Verificar se o email já está em uso
      const { data: emailCheck } = await supabase.rpc("check_user_profile_duplicates", {
        _email: formData.email,
        _full_name: "",
      });

      if (emailCheck) {
        const { email_in_auth, email_exists } = emailCheck as {
          email_in_auth: boolean;
          email_exists: boolean;
          name_exists: boolean;
        };

        if (email_in_auth || email_exists) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está sendo utilizado.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      if (isTechnician) {
        // Cadastro de técnico de laboratório
        if (!selectedLabId) {
          toast({
            title: "Laboratório não selecionado",
            description: "Por favor, selecione o laboratório ao qual você é técnico.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Validar que o nome informado bate exatamente com o técnico autorizado
        const { data: labRow, error: labLookupError } = await supabase
          .from("laboratories")
          .select("technician_name")
          .eq("id", selectedLabId)
          .maybeSingle();

        if (labLookupError || !labRow) {
          toast({
            title: "Erro",
            description: "Não foi possível validar o laboratório selecionado.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const registeredTechName = (labRow.technician_name ?? "").trim();
        if (!registeredTechName) {
          toast({
            title: "Técnico não autorizado",
            description:
              "Este laboratório ainda não tem um técnico cadastrado pela coordenação. Solicite ao coordenador que registre o nome do técnico no painel.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (formData.fullName.trim() !== registeredTechName) {
          toast({
            title: "Nome não confere",
            description:
              "O nome informado não corresponde ao técnico autorizado para este laboratório. Digite-o exatamente como foi cadastrado pela coordenação.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }


        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/email-confirmed`,
            data: {
              full_name: formData.fullName,
              institution: "UFBA",
              phone: formData.phone,
              is_technician: true,
              laboratory_id: selectedLabId,
            },
          },
        });

        if (authError || !authData.user) {
          toast({
            title: "Erro no registro",
            description: authError?.message || "Erro ao criar conta.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Criar perfil de técnico via edge function (service role)
        const { error: functionError } = await supabase.functions.invoke("register-technician", {
          body: {
            user_id: authData.user.id,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            laboratory_id: selectedLabId,
          },
        });

        if (functionError) {
          console.error("Erro ao registrar técnico:", functionError);
          toast({
            title: "Cadastro parcialmente concluído",
            description:
              "Conta criada, mas houve um erro ao vincular o laboratório. Entre em contato com o administrador.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Cadastro realizado!",
            description:
              "Um email de confirmação foi enviado para " +
              formData.email +
              ". Por favor, confirme seu email para poder fazer login.",
            duration: 8000,
          });
        }

        setRegisteredEmail(formData.email);
        setSuccess(true);
      } else {
        // Cadastro de pesquisador (fluxo original com pré-cadastro)
        // Verificar se o nome foi pré-cadastrado pelo administrador
        const preRegisteredProfile = await checkPreRegisteredName(formData.fullName);

        if (!preRegisteredProfile) {
          toast({
            title: "Acesso não autorizado",
            description:
              "Seu nome não foi encontrado no sistema. Entre em contato com o administrador para ser adicionado primeiro.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Verificar se o perfil já tem user_id (já foi registrado)
        if (preRegisteredProfile.user_id) {
          toast({
            title: "Usuário já registrado",
            description: "Este pesquisador já completou o registro.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Criar conta no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/email-confirmed`,
            data: {
              full_name: formData.fullName,
              institution: "UFBA",
              phone: formData.phone,
              researcher_route: preRegisteredProfile.researcher_route || "pesquisador",
              profile_id: preRegisteredProfile.id,
            },
          },
        });

        if (authError) {
          toast({
            title: "Erro no registro",
            description: authError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        toast({
          title: "Cadastro realizado!",
          description:
            "Um email de confirmação foi enviado para " +
            formData.email +
            ". Por favor, confirme seu email para poder fazer login e editar suas informações.",
          duration: 8000,
        });

        setRegisteredEmail(formData.email);
        setSuccess(true);
      }
    } catch (error: any) {
      toast({
        title: "Erro no registro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleResendEmail = async () => {
    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: registeredEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`,
        },
      });

      if (error) {
        toast({
          title: "Erro ao reenviar email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email reenviado!",
          description: "Um novo email de confirmação foi enviado para " + registeredEmail,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || recoverySent) return;
    const result = z.string().trim().email("Email inválido").safeParse(resetEmail);
    if (!result.success) {
      toast({ title: "Email inválido", description: "Por favor, insira um email válido.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { skipped, error } = await recoveryRequest.current(result.data, window.location.origin);
      if (skipped) return;
      if (error) {
        toast({ title: "Erro ao enviar recuperação", description: recoveryErrorMessage(error), variant: "destructive" });
        return;
      }
      setRecoverySent(true);
      toast({ title: "Solicitação recebida", description: "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha. Verifique também a pasta de spam." });
    } catch {
      toast({ title: "Erro ao enviar recuperação", description: "Não foi possível conectar ao serviço. Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className={styles.sign}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          height: "100vh",
          width: "100vw",
        }}
      >
        <HomeButton />
        <div className={styles.container}>
          <div className={styles.logo}>
            <img src={logocpgg} alt="CPGG" />
          </div>
          <div className={styles.formBox} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className={styles.formTitle}>
              <p>Cadastro Realizado!</p>
            </div>
            <div style={{ padding: "20px", textAlign: "center" }}>
              <p style={{ fontSize: "16px", marginBottom: "15px" }}>
                <strong>Um email de confirmação foi enviado para o endereço cadastrado.</strong>
              </p>
              <p style={{ marginBottom: "10px" }}>
                Por favor, verifique sua caixa de entrada (e também a pasta de spam) e clique no link de confirmação.
              </p>
              <p style={{ marginBottom: "20px", color: "#666" }}>
                Após confirmar seu email, você poderá fazer login e editar suas informações pessoais na plataforma.
              </p>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isResending ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  opacity: isResending ? 0.6 : 1,
                  transition: "all 0.2s",
                }}
              >
                {isResending ? "Reenviando..." : "Reenviar email de confirmação"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div
        className={styles.sign}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          height: "100vh",
          width: "100vw",
        }}
      >
        <HomeButton />
        <div className={styles.container}>
          <div className={styles.logo}>
            <img src={logocpgg} alt="CPGG" />
          </div>

          <div className={styles.formBox} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className={styles.formTitle}>
              <p>Recuperar Senha</p>
            </div>

            <form onSubmit={handleVerifyEmail} className={styles.form}>
              <p style={{ marginBottom: "20px", fontSize: "14px", color: "#666", textAlign: "center" }}>
                {recoverySent ? "Se este e-mail estiver cadastrado, o link de recuperação será enviado. Verifique sua caixa de entrada e a pasta de spam." : "Digite seu email cadastrado para receber o link de redefinição de senha."}
              </p>
              <input
                type="email"
                placeholder="Email cadastrado"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || recoverySent}>
                {isLoading ? "Enviando..." : recoverySent ? "Solicitação recebida" : "Enviar link"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                }}
                disabled={isLoading}
                style={{
                  marginTop: "10px",
                  backgroundColor: "#6b7280",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                Voltar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.sign}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        height: "100vh",
        width: "100vw",
      }}
    >
      <HomeButton />
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src={logocpgg} alt="CPGG" />
        </div>

          <div className={styles.formBox} style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className={styles.formTitle}>
              <p>Criar Nova Conta</p>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(0, 0, 0, 0.5)",
                  marginTop: "8px",
                  fontWeight: "normal",
                }}
              >
                {isTechnician
                  ? "Cadastro para técnicos de laboratório vinculados ao CPGG"
                  : "A criação de uma conta permite ao pesquisador alterar as informações da sua página pessoal"}
              </p>
            </div>

            <div className={styles.roleToggle}>
              <button
                type="button"
                className={!isTechnician ? styles.activeRole : ""}
                onClick={() => {
                  setIsTechnician(false);
                  setSelectedLabId("");
                }}
                disabled={isLoading}
              >
                Pesquisador
              </button>
              <button
                type="button"
                className={isTechnician ? styles.activeRole : ""}
                onClick={() => {
                  setIsTechnician(true);
                }}
                disabled={isLoading}
              >
                Técnico de laboratório
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form} style={{ paddingTop: "0.75rem" }}>
            <div style={{ width: "100%" }}>
              <input
                type="text"
                name="fullName"
                placeholder="Nome completo"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                style={{ marginBottom: "4px" }}
              />
              <p
                style={{
                  fontSize: "11px",
                  color: "#dc2626",
                  margin: "0 0 10px 0",
                  fontWeight: "500",
                }}
              >
                O nome deve ser obrigatoriamente seu nome COMPLETO, sem abreviações
              </p>
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Telefone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            {isTechnician && (
              <div className={styles.labSelection}>
                <p className={styles.labSelectionTitle}>Selecione o laboratório:</p>
                {isLoadingLabs ? (
                  <p className={styles.labLoading}>Carregando laboratórios...</p>
                ) : labs.length === 0 ? (
                  <p className={styles.labLoading}>Nenhum laboratório encontrado.</p>
                ) : (
                  <div className={styles.labGrid}>
                    {labs.map((lab) => (
                      <label
                        key={lab.id}
                        className={`${styles.labOption} ${
                          selectedLabId === lab.id ? styles.labOptionSelected : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLabId === lab.id}
                          onChange={() =>
                            setSelectedLabId((prev) => (prev === lab.id ? "" : lab.id))
                          }
                          disabled={isLoading}
                        />
                        <span>
                          {lab.name} ({lab.acronym})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            <input
              type="password"
              name="password"
              placeholder="Senha (mínimo 6 caracteres)"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              minLength={6}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar senha"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <div style={{ display: "flex", justifyContent: "center", margin: "15px 0" }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>
            <button type="submit" disabled={isLoading || !captchaToken}>
              {isLoading ? "Registrando..." : "Criar Conta"}
            </button>
            <button
              type="button"
              className={styles.forgotPassword}
              onClick={() => {
                setShowForgotPassword(true);
                setResetEmail("");
              }}
              disabled={isLoading}
            >
              Esqueci minha senha
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
