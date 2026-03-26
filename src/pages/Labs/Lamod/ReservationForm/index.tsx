import { useState } from "react";
import { Header } from "../../../../components/Header";
import { supabase } from "../../../../integrations/supabase/client";
import styles from "./LamodReservation.module.css";
import { toast } from "@/hooks/use-toast";

export function LamodRF() {
  const [formData, setFormData] = useState({
    serviceDescription: "",
    fullName: "",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceDescription || !formData.fullName || !formData.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email to lab chief
      const { error } = await supabase.functions.invoke("send-lemar-reservation", {
        body: {
          applicantName: formData.fullName,
          applicantEmail: formData.email,
          sampleDescription: formData.serviceDescription,
          sampleType: "Modelagem Geológica",
          numberOfSamples: "N/A",
          analysisType: ["Modelagem Física"],
          applicantInstitution: "",
          purpose: "Solicitação de Serviço - LAMOD",
        },
      });

      if (error) throw error;

      toast({
        title: "Solicitação Enviada com Sucesso!",
        description: "Em breve o chefe do laboratório entrará em contato por e-mail.",
      });

      setFormData({
        serviceDescription: "",
        fullName: "",
        email: "",
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
          <h1 className={styles.title}>Reservas</h1>
          <p className={styles.subtitle}>
            Para solicitar nossos serviços de modelagem geológica, contate-nos através do formulário abaixo.
          </p>
          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <label htmlFor="serviceDescription">Descrição do Serviço *</label>
              <textarea
                id="serviceDescription"
                value={formData.serviceDescription}
                onChange={(e) => handleInputChange("serviceDescription", e.target.value)}
                placeholder="Descreva o serviço de modelagem desejado"
                rows={4}
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="fullName">Nome Completo *</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Digite seu email"
                required
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Submeter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
