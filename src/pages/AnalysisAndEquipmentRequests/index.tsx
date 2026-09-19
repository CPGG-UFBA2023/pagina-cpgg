import React from 'react';
import { Paperclip, Wrench } from '@phosphor-icons/react';
import { IconLarge } from '../../components/Card/components/IconLarge';
import { TransparentCard } from '../../components/TransparentCard';
import styles from './request.module.css';
import { Highlight } from '../../components/Highlight';
import { Card } from '../../components/Card';
import { CheckBox } from '../../components/CheckBox';
import { useLanguage } from '@/contexts/LanguageContext';


export function AnalysisAndEquipmentRequests() {
    const { language } = useLanguage();
    const en = language === 'en';

    return (
        <div className={styles.AnalysisAndEquipmentRequestsContainer}>
            <TransparentCard>
                {/* <IconLarge>
                    <Wrench size={64} color='#363F5F' />
                </IconLarge> */}
                <Highlight
                    title={en ? 'REQUESTS FOR ANALYSES AND EQUIPMENT USE' : 'SOLICITAÇÕES DE ANÁLISES E USO DE EQUIPAMENTOS'}
                    color='#363F5F'
                    subtitle={en ? 'For UFBA faculty members' : 'Para professores da UFBA'}
                    colorSubtitle='#969CB2'
                />
            </TransparentCard>

            <ul className={styles.List}>
                <li className={styles.ListItem}>
                    {en ? 'For research projects, attach the department’s approval minutes.' : 'Para Projetos de Pesquisa anexe a ata de aprovação no Departamento'}
                </li>

                <li className={styles.ListItem}>
                    {en ? 'Funded projects may be asked to support the laboratory with essential operating supplies.' : 'Projetos com recursos serão convidados a auxiliar o laboratório com itens necessários ao seu funcionamento'}
                </li>

                <li className={styles.ListItem}>
                    {en ? 'For teaching activities, attach the current semester course plan approved by the department, including the planned equipment use.' : 'Para Atividades de Ensino anexe o Plano da Disciplina aprovado pelo Departamento no semestre corrente, contando o uso do(s) equipamento(s)'}
                </li>

                <li className={styles.ListItem}>
                    {en ? 'For undergraduate theses, attach the work plan submitted for the course.' : "Para TCC's anexe o plano de trabalho apresentado na disciplina"}
                </li>

                <form className={styles.FormContainer} onSubmit={() => { }}>
                    <Card height={130}>
                        <div className={styles.Container}>
                            <h3 className={styles.FormTitle}>{en ? 'Type of Activity' : 'Tipo de Atividade'}</h3>
                            <CheckBox id='learn' label={en ? 'Teaching' : 'Ensino'} />
                            <CheckBox id='tcc' label='TCC' />
                            <CheckBox id='research' label={en ? 'Research Project' : 'Projeto de Pesquisa'} />
                            <CheckBox id='consultancy' label={en ? 'Consulting' : 'Consultoria'} />
                            <CheckBox id='others' label={en ? 'Other' : 'Outras'} />
                        </div>
                    </Card>

                    <Card>
                        <h3 className={styles.FormTitle}>{en ? 'Date of Use' : 'Data de uso'}</h3>
                    </Card>

                    <Card height={110} >
                        <div className={styles.Container}>
                            <h3 className={styles.FormTitle}>{en ? 'Attach the required document' : 'Anexe o respectivo documento necessário'}</h3>
                            <Paperclip size={64} color='black' />
                        </div>
                    </Card>

                    <Card height={110} >
                        <div className={styles.Container}>
                            <h3 className={styles.FormTitle}>{en ? 'Select the desired equipment' : 'Marque o(s) equipamento(s) desejado(s)'}</h3>
                            <CheckBox id='gravimeter' label='Gravímetro CG5 Scintrex' />
                            <CheckBox id='v8phoenix' label='V8-Phoenix' />
                        </div>
                    </Card>

                    <button className={styles.SendButton}>
                        <span className={styles.SendButtonTitle}>{en ? 'Submit' : 'Enviar'}</span>
                    </button>

                </form>
            </ul>

        </div>
    )
}