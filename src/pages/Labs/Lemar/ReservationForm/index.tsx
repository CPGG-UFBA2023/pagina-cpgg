import { useState } from "react";
import { Header } from "../../../../components/Header";
import { supabase } from "../../../../integrations/supabase/client";
import styles from "./LemarReservation.module.css";
import { toast } from "@/hooks/use-toast";

export function LemarRF() {
  const [formData, setFormData] = useState({
    sampleType: "",
    analysisType: [] as string[],
    numberOfSamples: "",
    sampleDescription: "",
    applicantName: "",
    applicantEmail: "",
    applicantPassword: "",
    applicantInstitution: "",
    purpose: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const analysisOptions = [
    "Elementos Terras-Raras (ETR)",
    "Elementos Traço (Rb, Sr, Ba, Cs, Zr, Nb, Ta, Y, Pb, Th, U)",
    "Isotopia U/Pb em zircão",
    "Análise LA-ICP-MS (in situ)",
  ];

  const handleAnalysisChange = (analysis: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        analysisType: [...prev.analysisType, analysis],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        analysisType: prev.analysisType.filter((a) => a !== analysis),
      }));
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.analysisType.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um tipo de análise",
        variant: "destructive",
      });
      return;
    }

    if (!formData.numberOfSamples || !formData.applicantName || !formData.applicantEmail || !formData.applicantPassword || !formData.purpose) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.applicantEmail)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Validar credenciais do usuário
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.applicantEmail,
        password: formData.applicantPassword,
      });

      if (authError || !authData.user) {
        toast({
          title: "Erro de Autenticação",
          description: "Email ou senha incorretos. Somente pesquisadores cadastrados podem solicitar análises.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro na autenticação:", error);
      toast({
        title: "Erro",
        description: "Erro ao verificar credenciais. Tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("send-lemar-reservation", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Solicitação Enviada com Sucesso!",
        description: "Em breve o chefe do laboratório entrará em contato por e-mail.",
      });

      setTimeout(() => {
        window.location.href = '/labs/lemar/success';
      }, 2000);

      setFormData({
        sampleType: "",
        analysisType: [],
        numberOfSamples: "",
        sampleDescription: "",
        applicantName: "",
        applicantEmail: "",
        applicantPassword: "",
        applicantInstitution: "",
        purpose: "",
      });
    } catch (error: any) {
      console.error("Erro ao enviar solicitação:", error);
      toast({
        title: "Erro",
        description: `Erro ao enviar solicitação: ${error?.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Formulário de Solicitação de Análises - LEMAR</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <label>Tipo(s) de Análise Desejado(s): *</label>
              <div className={styles.equipmentList}>
                {analysisOptions.map((analysis) => (
                  <div key={analysis} className={styles.equipmentItem}>
                    <input
                      type="checkbox"
                      id={analysis}
                      checked={formData.analysisType.includes(analysis)}
                      onChange={(e) => handleAnalysisChange(analysis, e.target.checked)}
                    />
                    <label htmlFor={analysis}>{analysis}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.form}>
              <label htmlFor="sampleType">Tipo de Amostra</label>
              <input
                type="text"
                id="sampleType"
                value={formData.sampleType}
                onChange={(e) => handleInputChange("sampleType", e.target.value)}
                placeholder="Ex: rocha, mineral, solo"
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="numberOfSamples">Número de Amostras *</label>
              <input
                type="number"
                id="numberOfSamples"
                value={formData.numberOfSamples}
                onChange={(e) => handleInputChange("numberOfSamples", e.target.value)}
                placeholder="Quantidade de amostras"
                min="1"
                required
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="sampleDescription">Descrição das Amostras</label>
              <textarea
                id="sampleDescription"
                value={formData.sampleDescription}
                onChange={(e) => handleInputChange("sampleDescription", e.target.value)}
                placeholder="Descreva as amostras (granulometria, preparação, etc.)"
                rows={3}
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="applicantName">Nome do Solicitante *</label>
              <input
                type="text"
                id="applicantName"
                value={formData.applicantName}
                onChange={(e) => handleInputChange("applicantName", e.target.value)}
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="applicantInstitution">Instituição</label>
              <input
                type="text"
                id="applicantInstitution"
                value={formData.applicantInstitution}
                onChange={(e) => handleInputChange("applicantInstitution", e.target.value)}
                placeholder="Ex: UFBA, USP, Empresa X"
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="applicantEmail">Email do Solicitante *</label>
              <input
                type="email"
                id="applicantEmail"
                value={formData.applicantEmail}
                onChange={(e) => handleInputChange("applicantEmail", e.target.value)}
                placeholder="Digite seu email"
                required
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="applicantPassword">Senha *</label>
              <input
                type="password"
                id="applicantPassword"
                value={formData.applicantPassword}
                onChange={(e) => handleInputChange("applicantPassword", e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="purpose">Finalidade *</label>
              <select
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                required
              >
                <option value="">Selecione a finalidade</option>
                <option value="TCC">TCC</option>
                <option value="Pós-Graduação">Pós-Graduação</option>
                <option value="Projeto de Pesquisa">Projeto de Pesquisa</option>
                <option value="Uso em disciplina">Uso em disciplina</option>
                <option value="Consultoria/Serviços">Consultoria/Serviços</option>
                <option value="Curso">Curso</option>
              </select>
            </div>

            <div className={styles.agreementText}>
              <p>
                <strong>
                  Estou de acordo em expressar agradecimentos ao LEMAR/CPGG pelo uso do(s) equipamento(s) utilizado(s) nos trabalhos apresentados
                </strong>
              </p>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
