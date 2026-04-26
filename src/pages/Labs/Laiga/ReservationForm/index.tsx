import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../../../components/Header";
import { supabase } from "../../../../integrations/supabase/client";
import { LaigaEquipmentEditor } from "../../../../components/LaigaEquipmentEditor";
import styles from "./LaigaReservation.module.css";
import { toast } from "@/hooks/use-toast";

export function RF() {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    selectedEquipments: [] as string[],
    otherEquipment: "",
    peripherals: "",
    withdrawalDate: "",
    returnDate: "",
    purpose: "",
    applicantName: "",
    applicantEmail: "",
    applicantPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch equipments from database
  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from("laiga_equipment")
        .select("name")
        .eq("is_available", true)
        .order("name");

      if (error) throw error;

      const equipmentNames = (data || []).map((item) => item.name).sort();
      setEquipments(equipmentNames);
    } catch (error: any) {
      console.error("Erro ao buscar equipamentos:", error);
      // Fallback to hardcoded list if database fails
      setEquipments(
        [
          "Bússola Brunton",
          "Caminhão de fonte sísmica AWD",
          "Caminhonete 4x4",
          "Elrec Pro",
          "Gamaespectrômetro RS125",
          "Gerador Honda 3,6 KVA",
          "Gerador Honda EG5500",
          "GPR IDS-RIS MF-HI-MOD",
          "GPR SIR 20",
          "GPR SIR 3000",
          "GPR SIR 4000",
          "GPS diferencial SP60",
          "GPS Etrex10",
          "Gravímetro CG5",
          "Magnetômetro Marinho G882",
          "Magnetômetro Terrestre GSN19",
          "Martelo de Geólogo",
          "Percômetro para medidas de condutividade em amostras de testemunho",
          "Perfuratriz para amostragem de solo",
          "Sismógrafo Geode48",
          "Sonar Marinho DE340D e DE680D",
          "Susceptibilímetro KT10",
          "Syscal Pro",
          "V8 Phoenix",
          "VLF T-VLF",
        ].sort(),
      );
    }
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        selectedEquipments: [...prev.selectedEquipments, equipment],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedEquipments: prev.selectedEquipments.filter((eq) => eq !== equipment),
      }));
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Updated: 2025-10-12 20:40 - Fixed redirect and email

    // Validações
    if (formData.selectedEquipments.length === 0 && !formData.otherEquipment) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um equipamento",
        variant: "destructive",
      });
      return;
    }

    if (!formData.withdrawalDate || !formData.returnDate) {
      toast({
        title: "Erro",
        description: "Preencha as datas de retirada e devolução",
        variant: "destructive",
      });
      return;
    }

    if (!formData.purpose || !formData.applicantName || !formData.applicantEmail || !formData.applicantPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Validação de email
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
          description: "Email ou senha incorretos. Somente pesquisadores cadastrados podem reservar equipamentos.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Fazer logout imediatamente após validação (não manter sessão ativa)
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
      console.log("Enviando dados para a função:", formData);

      const { data, error } = await supabase.functions.invoke("send-laiga-reservation", {
        body: formData,
      });

      console.log("Resposta da função:", { data, error });

      if (error) {
        console.error("Erro da função:", error);
        throw error;
      }

      console.log("Sucesso! Dados recebidos:", data);
      console.log("ID da reserva:", data?.reservationId);

      toast({
        title: "Solicitação Enviada com Sucesso!",
        description: "Em breve o coordenador do laboratório entrará em contato por e-mail.",
      });

      // Resetar formulário antes de redirecionar
      setFormData({
        selectedEquipments: [],
        otherEquipment: "",
        peripherals: "",
        withdrawalDate: "",
        returnDate: "",
        purpose: "",
        applicantName: "",
        applicantEmail: "",
        applicantPassword: "",
      });
    } catch (error: any) {
      console.error("Erro ao enviar solicitação:", error);
      console.error("Detalhes do erro:", {
        message: error?.message,
        details: error?.details,
        stack: error?.stack,
      });

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
        <LaigaEquipmentEditor onEquipmentChange={setEquipments} />

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Formulário de Reserva de Equipamentos - LAIGA</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles.form}>
              <label>Equipamentos Disponíveis:</label>
              <div className={styles.equipmentList}>
                {equipments.map((equipment) => (
                  <div key={equipment} className={styles.equipmentItem}>
                    <input
                      type="checkbox"
                      id={equipment}
                      checked={formData.selectedEquipments.includes(equipment)}
                      onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                    />
                    <label htmlFor={equipment}>{equipment}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.form}>
              <label htmlFor="otherEquipment">Outro equipamento não listado acima?</label>
              <input
                type="text"
                id="otherEquipment"
                value={formData.otherEquipment}
                onChange={(e) => handleInputChange("otherEquipment", e.target.value)}
                placeholder="Digite outros equipamentos necessários"
              />
            </div>

            <div className={styles.form}>
              <label htmlFor="peripherals">
                Algum periférico adicional? (ex: rolo de cabos, tenda, garra d'água, eletrodos, etc)
              </label>
              <textarea
                id="peripherals"
                value={formData.peripherals}
                onChange={(e) => handleInputChange("peripherals", e.target.value)}
                placeholder="Descreva os periféricos necessários"
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

            <div className={styles.dateContainer}>
              <div className={styles.form}>
                <label htmlFor="withdrawalDate">Data de Retirada *</label>
                <input
                  type="date"
                  id="withdrawalDate"
                  value={formData.withdrawalDate}
                  onChange={(e) => handleInputChange("withdrawalDate", e.target.value)}
                  required
                />
              </div>

              <div className={styles.form}>
                <label htmlFor="returnDate">Data de Devolução *</label>
                <input
                  type="date"
                  id="returnDate"
                  value={formData.returnDate}
                  onChange={(e) => handleInputChange("returnDate", e.target.value)}
                  required
                />
              </div>
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
              <label htmlFor="purpose">Utilidade *</label>
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
                  Estou de acordo em expressar agradecimentos ao LAIGA/CPGG pelo uso do(s) equipamento(s) utilizado(s)
                  nos trabalhos apresentados
                </strong>
              </p>
            </div>

            <div className={styles.agreementText}>
              <p>
                <strong>
                  Estou de acordo em reportar no ato da entrega de possíveis problemas ou avarias que o(s)
                  equipamento(s) tenham sofridos durante o uso
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
