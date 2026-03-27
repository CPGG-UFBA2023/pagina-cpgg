import { useState } from 'react'
import styles from './ltmrx-form.module.css'

const TIPOS_UTILIZACAO = [
  'Consultoria',
  'Graduação (TCC/TFG)',
  'Graduação (Disciplina/Ensino)',
  'Iniciação Científica',
  'Mestrado',
  'Doutorado',
  'Pós-Doutorado',
  'Grupo de Pesquisa',
]

const PROPRIEDADES = ['Corrosivo', 'Radioativo', 'Tóxico', 'Inflamável', 'Libera gases']
const ASPECTOS_MATRIZ = ['Rochas (trazer petrografia)', 'Mineral (trazer descrição)', 'Outros']
const GRANULOMETRIAS = ['< #200 mesh', 'Outra']
const AMOSTRAS = ['Amostra 1', 'Amostra 2', 'Amostra 3', 'Amostra 4', 'Amostra 5']
const NUM_AMOSTRAS_OPTIONS = ['1', '2', '3', '4', '5']

interface FormData {
  orgao: string
  solicitante: string
  telefone: string
  tiposUtilizacao: string[]
  nomeProjeto: string
  profOrientador: string
  numAmostras: string
  codigosAmostras: string[]
  propriedades: Record<string, string>
  aspectosMatriz: Record<string, string[]>
  granulometria: Record<string, string[]>
  tipoAnalise: string[]
  condicoesEspeciais: string
  observacoes: string
}

export function LtmRxRequestForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    orgao: '',
    solicitante: '',
    telefone: '',
    tiposUtilizacao: [],
    nomeProjeto: '',
    profOrientador: '',
    numAmostras: '1',
    codigosAmostras: ['', '', '', '', ''],
    propriedades: {},
    aspectosMatriz: {},
    granulometria: {},
    tipoAnalise: [],
    condicoesEspeciais: '',
    observacoes: '',
  })

  const totalSteps = 5

  const handleCheckbox = (field: 'tiposUtilizacao' | 'tipoAnalise', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  const handleRadioGrid = (prop: string, amostra: string) => {
    setFormData(prev => ({
      ...prev,
      propriedades: { ...prev.propriedades, [prop]: amostra },
    }))
  }

  const handleCheckboxGrid = (
    field: 'aspectosMatriz' | 'granulometria',
    row: string,
    amostra: string
  ) => {
    setFormData(prev => {
      const current = prev[field][row] || []
      const updated = current.includes(amostra)
        ? current.filter(a => a !== amostra)
        : [...current, amostra]
      return { ...prev, [field]: { ...prev[field], [row]: updated } }
    })
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={styles.formContainer}>
        <h3 className={styles.formTitle}>Solicitação Enviada!</h3>
        <p className={styles.successText}>
          Sua solicitação de análise foi registrada com sucesso. Entraremos em contato pelo e-mail
          informado.
        </p>
        <p className={styles.successText}>
          Lembre-se de entregar as amostras juntamente com o Termo de Compromisso assinado no
          Laboratório de Tecnologia Mineral – Raios X, Bloco B, 1º andar, Sala 202B.
        </p>
        <button onClick={onBack} className={styles.btnPrimary}>
          Voltar ao Laboratório
        </button>
      </div>
    )
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.stepIndicator}>
        Página {step + 1} de {totalSteps}
      </div>

      {step === 0 && (
        <>
          <h3 className={styles.sectionTitle}>OBSERVAÇÕES IMPORTANTES</h3>
          <ol className={styles.obsList}>
            <li>
              As amostras devem ser acondicionadas em embalagem adequada (potes com tampa ou
              eppendorfs) e identificadas com etiquetas. A IDENTIFICAÇÃO DEVE SER REALIZADA PELO
              USUÁRIO.
            </li>
            <li>
              Amostras de pós devem ser previamente preparadas, peneiradas em malha #200 mesh e
              homogêneas. O RAIOS X LAPAG não dispõe de infraestrutura (almofarizes/pistilos/peneiras)
              e incentiva os alunos na preparação de suas amostras.
            </li>
            <li>
              As amostras deverão ser entregues juntamente com o Termo de Compromisso (disponível na
              pasta compartilhada) preenchido e assinado pelo orientador, no Laboratório de Tecnologia
              Mineral – Raios X, Instituto de Geociências, Bloco B, 1º andar, Sala 202B.
            </li>
            <li>É necessário um mínimo de 5g por amostra.</li>
            <li>
              Amostras em desacordo com as observações supracitadas serão devolvidas ao solicitante.
            </li>
          </ol>
        </>
      )}

      {step === 1 && (
        <>
          <h3 className={styles.sectionTitle}>Dados Cadastrais</h3>

          <label className={styles.label}>
            Órgão / Empresa / Departamento / Laboratório *
          </label>
          <input
            type="text"
            className={styles.input}
            value={formData.orgao}
            onChange={e => setFormData(prev => ({ ...prev, orgao: e.target.value }))}
            required
          />

          <label className={styles.label}>Solicitante *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.solicitante}
            onChange={e => setFormData(prev => ({ ...prev, solicitante: e.target.value }))}
            required
          />

          <label className={styles.label}>Telefone</label>
          <input
            type="text"
            className={styles.input}
            value={formData.telefone}
            onChange={e => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
          />

          <label className={styles.label}>Tipo de utilização *</label>
          <div className={styles.checkboxGroup}>
            {TIPOS_UTILIZACAO.map(tipo => (
              <label key={tipo} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.tiposUtilizacao.includes(tipo)}
                  onChange={() => handleCheckbox('tiposUtilizacao', tipo)}
                />
                {tipo}
              </label>
            ))}
          </div>

          <label className={styles.label}>Nome do Projeto *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.nomeProjeto}
            onChange={e => setFormData(prev => ({ ...prev, nomeProjeto: e.target.value }))}
            required
          />

          <label className={styles.label}>Prof(a) Orientador(a)/Responsável *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.profOrientador}
            onChange={e => setFormData(prev => ({ ...prev, profOrientador: e.target.value }))}
            required
          />
        </>
      )}

      {step === 2 && (
        <>
          <h3 className={styles.sectionTitle}>Descrição Geral das Amostras</h3>

          <label className={styles.label}>Número de amostras *</label>
          <select
            className={styles.select}
            value={formData.numAmostras}
            onChange={e => setFormData(prev => ({ ...prev, numAmostras: e.target.value }))}
          >
            {NUM_AMOSTRAS_OPTIONS.map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <label className={styles.label}>Código das Amostras</label>
          {Array.from({ length: parseInt(formData.numAmostras) }).map((_, i) => (
            <input
              key={i}
              type="text"
              className={styles.input}
              placeholder={`Código da Amostra ${i + 1}`}
              value={formData.codigosAmostras[i]}
              onChange={e => {
                const codes = [...formData.codigosAmostras]
                codes[i] = e.target.value
                setFormData(prev => ({ ...prev, codigosAmostras: codes }))
              }}
            />
          ))}

          <label className={styles.label}>Propriedade das Amostras *</label>
          <div className={styles.gridTable}>
            <div className={styles.gridHeader}>
              <span></span>
              {AMOSTRAS.slice(0, parseInt(formData.numAmostras)).map(a => (
                <span key={a}>{a}</span>
              ))}
            </div>
            {PROPRIEDADES.map(prop => (
              <div key={prop} className={styles.gridRow}>
                <span className={styles.gridLabel}>{prop}</span>
                {AMOSTRAS.slice(0, parseInt(formData.numAmostras)).map(amostra => (
                  <span key={amostra}>
                    <input
                      type="radio"
                      name={`prop-${prop}`}
                      checked={formData.propriedades[prop] === amostra}
                      onChange={() => handleRadioGrid(prop, amostra)}
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3 className={styles.sectionTitle}>Aspectos da Matriz e Granulometria</h3>

          <label className={styles.label}>Aspectos da Matriz *</label>
          <div className={styles.gridTable}>
            <div className={styles.gridHeader}>
              <span></span>
              {AMOSTRAS.slice(0, parseInt(formData.numAmostras)).map(a => (
                <span key={a}>{a}</span>
              ))}
            </div>
            {ASPECTOS_MATRIZ.map(asp => (
              <div key={asp} className={styles.gridRow}>
                <span className={styles.gridLabel}>{asp}</span>
                {AMOSTRAS.slice(0, parseInt(formData.numAmostras)).map(amostra => (
                  <span key={amostra}>
                    <input
                      type="checkbox"
                      checked={(formData.aspectosMatriz[asp] || []).includes(amostra)}
                      onChange={() => handleCheckboxGrid('aspectosMatriz', asp, amostra)}
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>

          <label className={styles.label}>Granulometria *</label>
          <div className={styles.gridTable}>
            <div className={styles.gridHeader}>
              <span></span>
              {AMOSTRAS.slice(0, parseInt(formData.numAmostras)).map(a => (
                <span key={a}>{a}</span>
              ))}
            </div>
            {GRANULOMETRIAS.map(gran => (
              <div key={gran} className={styles.gridRow}>
                <span className={styles.gridLabel}>{gran}</span>
                {AMOSTRAS.slice(0, parseInt(formData.numAmostras)).map(amostra => (
                  <span key={amostra}>
                    <input
                      type="checkbox"
                      checked={(formData.granulometria[gran] || []).includes(amostra)}
                      onChange={() => handleCheckboxGrid('granulometria', gran, amostra)}
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h3 className={styles.sectionTitle}>Tipo de Análise e Observações</h3>

          <label className={styles.label}>Tipo de Análise Solicitada *</label>
          <div className={styles.checkboxGroup}>
            {['DRX - Identificação de fases minerais', 'DRX - Determinação de parâmetros cristalinos', 'DRX - Composição normativa', 'DRX - Quantificação de fases minerais', 'WDX-FRX - Análise semi-quantitativa'].map(tipo => (
              <label key={tipo} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.tipoAnalise.includes(tipo)}
                  onChange={() => handleCheckbox('tipoAnalise', tipo)}
                />
                {tipo}
              </label>
            ))}
          </div>

          <label className={styles.label}>Condições Especiais de Análise</label>
          <textarea
            className={styles.textarea}
            value={formData.condicoesEspeciais}
            onChange={e => setFormData(prev => ({ ...prev, condicoesEspeciais: e.target.value }))}
            placeholder="Descreva condições especiais, se houver..."
            rows={3}
          />

          <label className={styles.label}>Observações Adicionais</label>
          <textarea
            className={styles.textarea}
            value={formData.observacoes}
            onChange={e => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Observações adicionais..."
            rows={3}
          />
        </>
      )}

      <div className={styles.btnGroup}>
        {step === 0 ? (
          <button onClick={onBack} className={styles.btnSecondary}>
            Voltar
          </button>
        ) : (
          <button onClick={() => setStep(s => s - 1)} className={styles.btnSecondary}>
            Anterior
          </button>
        )}
        {step < totalSteps - 1 ? (
          <button onClick={() => setStep(s => s + 1)} className={styles.btnPrimary}>
            Próximo
          </button>
        ) : (
          <button onClick={handleSubmit} className={styles.btnPrimary}>
            Enviar Solicitação
          </button>
        )}
      </div>
    </div>
  )
}
