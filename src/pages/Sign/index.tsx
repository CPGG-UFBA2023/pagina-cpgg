import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "../../hooks/use-toast";
import { HomeButton } from "../../components/HomeButton";
import { z } from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "./sign.module.css";
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
  const [showPasswordResetForm, setShowPasswordResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetProfileId, setResetProfileId] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const recaptchaResetRef = useRef<ReCAPTCHA>(null);

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
    setIsLoading(true);
    console.log("handleVerifyEmail - iniciando verificação de email:", resetEmail);

    try {
      // Validar email
      const emailSchema = z.string().trim().email("Email inválido");
      const validationResult = emailSchema.safeParse(resetEmail);

      if (!validationResult.success) {
        toast({
          title: "Email inválido",
          description: "Por favor, insira um email válido.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Buscar perfil pelo email
      const { data: profiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", resetEmail)
        .limit(1);

      if (profileError || !profiles || profiles.length === 0) {
        toast({
          title: "Email não encontrado",
          description: "Este email não está cadastrado no sistema.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const profile = profiles[0];

      console.log("Perfil ANTES do reset:", {
        id: profile.id,
        full_name: profile.full_name,
        has_description: !!profile.description,
        description_preview: profile.description?.substring(0, 50),
        has_photo: !!profile.photo_url,
        photo_url: profile.photo_url,
        email: profile.email,
        phone: profile.phone,
      });

      // Salvar o profile_id para usar depois
      setResetProfileId(profile.id);

      // Se o perfil tem user_id, resetar apenas os dados de autenticação (preservando description e photo_url)
      if (profile.user_id) {
        const { data: resetResult, error: resetError } = await supabase.rpc("reset_user_keep_profile_data", {
          _user_profile_id: profile.id,
        });

        console.log("Resultado do reset:", resetResult, resetError);

        if (resetError || (resetResult && !(resetResult as any).success)) {
          toast({
            title: "Erro",
            description: "Não foi possível limpar o registro anterior.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Verificar estado do perfil após reset
        const { data: updatedProfile } = await supabase.from("user_profiles").select("*").eq("id", profile.id).single();

        console.log("Perfil DEPOIS do reset:", {
          id: updatedProfile?.id,
          full_name: updatedProfile?.full_name,
          has_description: !!updatedProfile?.description,
          description_preview: updatedProfile?.description?.substring(0, 50),
          has_photo: !!updatedProfile?.photo_url,
          photo_url: updatedProfile?.photo_url,
          email: updatedProfile?.email,
          phone: updatedProfile?.phone,
          user_id: updatedProfile?.user_id,
        });
      } else {
        // Se não tem user_id, apenas salvar o profile_id
        console.log("Perfil não tem user_id, apenas salvando profile_id");
      }

      // Preencher apenas o nome completo - email e telefone devem ser preenchidos novamente
      setFormData((prev) => ({
        ...prev,
        fullName: profile.full_name,
        email: "",
        phone: "",
      }));

      toast({
        title: "Email verificado!",
        description:
          "Agora preencha seus novos dados para redefinir sua senha. Sua descrição e foto de perfil serão mantidas.",
      });

      console.log("Email verificado, mudando para formulário de redefinição");
      // Ir para o formulário de redefinição
      setShowPasswordResetForm(true);
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível verificar o email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
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
        recaptchaResetRef.current?.reset();
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

      // Verificar se o nome foi pré-cadastrado pelo administrador
      const preRegisteredProfile = await checkPreRegisteredName(formData.fullName);

      if (!preRegisteredProfile) {
        toast({
          title: "Acesso não autorizado",
          description: "Seu nome não foi encontrado no sistema. Entre em contato com o administrador.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Usar o profile_id salvo do reset, se disponível
      let profileIdToUse = resetProfileId || preRegisteredProfile.id;

      console.log("Criando nova conta com profile_id:", profileIdToUse);

      // Criar nova conta no Supabase Auth
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
            profile_id: profileIdToUse,
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
        title: "Senha redefinida com sucesso!",
        description: "Um email de confirmação foi enviado para " + formData.email + ". Por favor, confirme seu email.",
        duration: 8000,
      });

      setRegisteredEmail(formData.email);
      setSuccess(true);
      setShowForgotPassword(false);
      setShowPasswordResetForm(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
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

  if (showPasswordResetForm) {
    console.log("Renderizando formulário de redefinição de senha");
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
              <p>Redefinir Senha</p>
            </div>

            <div
              style={{
                backgroundColor: "#fef3c7",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #fbbf24",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#92400e",
                  textAlign: "center",
                  fontWeight: "500",
                  margin: 0,
                }}
              >
                ⚠️ Para redefinir sua senha, preencha novamente seus dados e a nova senha. Sua descrição e foto de
                perfil serão mantidas.
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className={styles.form}>
              <input
                type="text"
                name="fullName"
                placeholder="Nome completo"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <input
                type="email"
                name="email"
                placeholder="Novo email"
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
              <input
                type="password"
                name="password"
                placeholder="Nova senha (mínimo 6 caracteres)"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                minLength={6}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar nova senha"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <div style={{ display: "flex", justifyContent: "center", margin: "15px 0" }}>
                <ReCAPTCHA
                  ref={recaptchaResetRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>
              <button type="submit" disabled={isLoading || !captchaToken}>
                {isLoading ? "Redefinindo..." : "Redefinir Senha e Criar Nova Conta"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordResetForm(false);
                  setShowForgotPassword(false);
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

  if (showForgotPassword) {
    console.log("Renderizando formulário de verificação de email");
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
                Digite seu email cadastrado para iniciar a redefinição de senha.
              </p>
              <input
                type="email"
                placeholder="Email cadastrado"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Enviar"}
              </button>
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
              A criação de uma conta permite ao pesquisador alterar as informações da sua página pessoal
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
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
                setShowPasswordResetForm(false);
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
