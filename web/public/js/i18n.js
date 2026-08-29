// App-wide UI translation (English / Brazilian Portuguese). Only interface
// chrome is translated here — data that actually comes from SQL Server or
// RavenDB (pet names, AI-generated bios/tags, enum values like "InShelter")
// is left exactly as stored, per the demo's own "don't touch the data"
// premise. Persisted to localStorage so a reload keeps the chosen language.

const STRINGS = {
  en: {
    "header.title": "RavenDB CDC Demo — Vet Clinic & Shelter",
    "header.subtitle":
      "See how RavenDB's CDC Sink turns a live SQL Server database into searchable, AI-enriched documents — without changing a line of the legacy app.",
    "header.learnMore": "Learn more ▾",
    "header.hideDetails": "Hide details ▴",
    "header.byline": "A demo by Lucas Tavares, Technical Solutions Consultant at RavenDB.",

    "footer.docsLabel": "RavenDB CDC documentation:",
    "footer.githubRepo": "GitHub repo",

    "panelFooter.checking": "Checking connection…",
    "panelFooter.noStatus": "No status available",
    "panelFooter.connected": "Connected",
    "panelFooter.notConnected": "Not connected",
    "panelFooter.db": "DB: {name}",
    "panelFooter.tables": "{count} tables",
    "panelFooter.collections": "{count} collections",
    "panelFooter.openStudio": "Open Studio",

    "sql.panelTitle": "Microsoft SQL Server",
    "sql.connectionSettingsTitle": "Configure SQL Server connection",
    "sql.loadError": "Couldn't load the SQL Server schema: {error}",
    "sql.loadingSchema": "Loading schema…",
    "sql.sidebarError": "Couldn't load tables: {error}",
    "sql.sidebarLoading": "Loading tables…",
    "sql.searchPlaceholder": "Search {label}…",
    "sql.filterAll": "All {label}",
    "sql.newRecord": "+ New {noun}",
    "sql.noRecords": "No records found.",
    "sql.loading": "Loading…",
    "sql.loadingRecord": "Loading record…",
    "sql.backTo": "← Back to {label}",
    "sql.edit": "Edit",
    "sql.newTitle": "New {noun}",
    "sql.recordTitle": "{noun} #{id}",
    "sql.save": "Save",
    "sql.saving": "Saving…",
    "sql.cancel": "Cancel",
    "sql.delete": "Delete",
    "sql.deleteConfirm": "Delete this {noun}? This can't be undone.",
    "sql.relatedVia": "Related via {table}.{fk}",
    "sql.viaFk": "via {fk}",
    "sql.none": "— none —",
    "sql.prev": "← Prev",
    "sql.next": "Next →",
    "sql.pageOf": "Page {page} of {totalPages} · {total} row{plural}",
    "sql.yes": "Yes",
    "sql.no": "No",

    "cdcLog.show": "▾ CDC log",
    "cdcLog.hide": "▴ Hide CDC log",
    "cdcLog.title": "What SQL Server's CDC actually records",
    "cdcLog.explanation":
      "Every change to a CDC-enabled table gets written here first, in cdc.<table>_CT change tables — this is the exact raw stream RavenDB's CDC Sink polls and turns into document updates. Only Pets, People, and Pets' embedded children (Medical Records, Vaccinations, Adoption Applications) actually reach RavenDB; Employees/Veterinarians/Clinics/Adoptions have CDC enabled too but nothing subscribes to them.",
    "cdcLog.colTable": "Table",
    "cdcLog.colOperation": "Change",
    "cdcLog.colRecord": "Record",
    "cdcLog.colWhen": "When",
    "cdcLog.opInsert": "Insert",
    "cdcLog.opUpdate": "Update",
    "cdcLog.opDelete": "Delete",
    "cdcLog.empty": "No CDC activity recorded yet — edit something in a table above, or wait a moment for CDC Sink to catch up.",
    "cdcLog.loading": "Loading CDC log…",

    "hint.cdcCapture": "Starts/stops SQL Server's CDC capture job — pauses replication instantly without touching any data, so you can demo \"CDC off\" vs. \"CDC on\" live.",
    "hint.cdcSink": "The task that reads SQL Server's CDC stream and turns each change into a RavenDB document — the core of this whole demo.",
    "hint.genAi": "Writes an AI-generated adoption bio and temperament tags onto every rescued pet, from its raw intake notes.",
    "hint.embeddings": "Turns each pet's AI-written description into a vector, so the portal's search bar can match natural language like \"calm dog good with kids\".",
    "hint.agent": "The chat-based concierge — can search available pets and register a real adoption interest on a visitor's behalf.",

    "raven.panelTitle": "Adoption Portal",
    "raven.connectionSettingsTitle": "Configure RavenDB connection",
    "raven.statPetsTreated": "Pets treated by this clinic",
    "raven.statAvailable": "Available for adoption",
    "raven.statQueryTime": "Query time",
    "raven.statQueryTimeSub": "(static index)",
    "raven.statTokens": "AI tokens spent this session",
    "raven.chartSpecies": "Pets by species",
    "raven.chartOrigin": "Owned vs. rescued",
    "raven.chartStatus": "Pets by status",
    "raven.chartPulse": "Live CDC activity",
    "raven.chartTemperament": "Temperament of available pets (AI-generated)",
    "raven.chartTemperamentEmpty": "No AI temperament tags yet — enrich a few pets first.",
    "raven.chartTimeline": "Rescue-to-adoption timeline",
    "raven.chartTimelineEmpty": "Not enough dated activity yet to chart a timeline.",
    "raven.timelineRescues": "Rescues",
    "raven.timelineVisits": "Medical visits",
    "raven.timelineVaccinations": "Vaccinations",
    "raven.timelineAdoptions": "Approved adoptions",
    "raven.pulseLegend": "Document changes",
    "raven.meetNextPet": "Meet your next pet",
    "raven.askConcierge": "💬 Ask the Concierge",
    "raven.searchPlaceholder": "Describe the perfect pet… e.g. 'calm dog good with kids'",
    "raven.semanticSearch": "Semantic search",
    "raven.allAvailablePets": "All available pets",
    "raven.loadingPets": "Loading pets…",
    "raven.noPetsMatched": "No pets matched — try different words.",
    "raven.mixedBreed": "Mixed breed",
    "raven.bioPending": "AI bio not generated yet — check back shortly.",
    "raven.askAbout": "Ask the concierge about {name} →",
    "raven.vaccinated": "✓ Vaccinated ({vaccine})",
    "raven.vaccinatedNoName": "✓ Vaccinated",
    "raven.notVaccinated": "No vaccinations recorded yet",
    "raven.vetVisits": "{count} vet visit{plural}",
    "raven.toggleCdcSink": "CDC Sink",
    "raven.toggleGenAi": "GenAI enrichment",
    "raven.toggleEmbeddings": "Embeddings",
    "raven.toggleAgent": "Adoption Concierge",
    "raven.clearButton": "🧹 Clear RavenDB",
    "raven.clearButtonBusy": "Clearing…",
    "raven.clearConfirm":
      "This deletes every document and collection in RavenDB (including system collections like @embeddings and @cdc-states) and turns off CDC Sink, GenAI, Embeddings, and the Adoption Concierge. Continue?",
    "raven.clearFailed": "Failed to clear RavenDB.",
    "raven.errorPrefix": "Error: {message}",
    "chat.title": "🐾 Adoption Concierge",
    "chat.close": "Close chat",
    "chat.empty":
      "Tell me what you're looking for — size, temperament, energy level — and I'll help you find the right pet, and register your interest with the shelter when you're ready.",
    "chat.thinking": "Thinking…",
    "chat.placeholder": "Type a message… (Markdown works — Shift+Enter for a new line)",
    "chat.send": "Send",

    "sqlReset.button": "↺ Reset SQL Server data",
    "sqlReset.buttonBusy": "Resetting…",
    "sqlReset.confirm":
      "This restores SQL Server to its original seed data (undoing anything added or changed during this demo) and turns off CDC Sink. Continue?",
    "sqlReset.failed": "Failed to reset SQL Server data.",
    "cdcToggle.on": "CDC capture: on",
    "cdcToggle.off": "CDC capture: off",
    "cdcToggle.updating": "Updating…",

    "modal.close": "Close",
    "modal.save": "Save",
    "modal.saving": "Saving…",
    "modal.provisioning": "Provisioning… this can take a minute",
    "modal.loading": "Loading current settings…",
    "modal.hintFooter": "(shown in the footer)",
    "sqlModal.title": "SQL Server connection",
    "sqlModal.host": "Host",
    "sqlModal.port": "Port",
    "sqlModal.database": "Database",
    "sqlModal.user": "User",
    "sqlModal.password": "Password",
    "sqlModal.passwordPlaceholder": "Leave blank to keep the current password",
    "sqlModal.environment": "Environment label",
    "sqlModal.provisionCheckbox": "Provision the full environment on this server (create the database, schema, seed data, and enable CDC)",
    "sqlModal.connectedTo": "Connected to {host}:{port}/{database}.",
    "sqlModal.databaseCreated": "Database created.",
    "sqlModal.databaseExisted": "Database already existed.",
    "sqlModal.seededSummary": "Seeded {rows} rows across {tables} tables.",
    "sqlModal.cdcEnabled": "CDC enabled.",
    "sqlModal.cdcFailed": "CDC could not be enabled: {error}",
    "ravenModal.title": "RavenDB connection",
    "ravenModal.url": "URL",
    "ravenModal.environment": "Environment label",
    "ravenModal.provisionCheckbox": "Provision the full environment on this server (database, CDC Sink, GenAI, Embeddings, SQL ETL, Agent, index)",
    "ravenModal.apiKey": "OpenAI API key",
    "ravenModal.apiKeyHint": "(optional — leave blank to keep existing AI connection strings)",
    "ravenModal.chatModel": "Chat model",
    "ravenModal.embeddingModel": "Embedding model",
    "ravenModal.connectedTo": "Connected to {url}/{database}.",
    "ravenModal.databaseCreated": "Database created.",
    "ravenModal.databaseExisted": "Database already existed.",
    "ravenModal.aiCreated": "AI connection strings created.",
    "ravenModal.provisionedSummary": "CDC Sink, GenAI, Embeddings, SQL ETL, Agent, and the dashboard index are provisioned.",
  },

  pt: {
    "header.title": "RavenDB CDC Demo — Clínica Veterinária & Abrigo",
    "header.subtitle":
      "Veja como o CDC Sink do RavenDB transforma um SQL Server ao vivo em documentos pesquisáveis e enriquecidos por IA — sem mudar uma linha da aplicação legada.",
    "header.learnMore": "Saiba mais ▾",
    "header.hideDetails": "Ocultar detalhes ▴",
    "header.byline": "Uma demo do Lucas Tavares, Technical Solutions Consultant na RavenDB.",

    "footer.docsLabel": "Documentação de CDC do RavenDB:",
    "footer.githubRepo": "Repositório no GitHub",

    "panelFooter.checking": "Verificando conexão…",
    "panelFooter.noStatus": "Nenhum status disponível",
    "panelFooter.connected": "Conectado",
    "panelFooter.notConnected": "Não conectado",
    "panelFooter.db": "Banco: {name}",
    "panelFooter.tables": "{count} tabelas",
    "panelFooter.collections": "{count} coleções",
    "panelFooter.openStudio": "Abrir Studio",

    "sql.panelTitle": "Microsoft SQL Server",
    "sql.connectionSettingsTitle": "Configurar conexão do SQL Server",
    "sql.loadError": "Não foi possível carregar o schema do SQL Server: {error}",
    "sql.loadingSchema": "Carregando schema…",
    "sql.sidebarError": "Não foi possível carregar as tabelas: {error}",
    "sql.sidebarLoading": "Carregando tabelas…",
    "sql.searchPlaceholder": "Buscar {label}…",
    "sql.filterAll": "Todos: {label}",
    "sql.newRecord": "+ {article} {noun}",
    "sql.noRecords": "Nenhum registro encontrado.",
    "sql.loading": "Carregando…",
    "sql.loadingRecord": "Carregando registro…",
    "sql.backTo": "← Voltar para {label}",
    "sql.edit": "Editar",
    "sql.newTitle": "{article} {noun}",
    "sql.recordTitle": "{noun} #{id}",
    "sql.save": "Salvar",
    "sql.saving": "Salvando…",
    "sql.cancel": "Cancelar",
    "sql.delete": "Excluir",
    "sql.deleteConfirm": "Excluir {demonstrative} {noun}? Isso não pode ser desfeito.",
    "sql.relatedVia": "Relacionado via {table}.{fk}",
    "sql.viaFk": "via {fk}",
    "sql.none": "— nenhum —",
    "sql.prev": "← Anterior",
    "sql.next": "Próxima →",
    "sql.pageOf": "Página {page} de {totalPages} · {total} linha{plural}",
    "sql.yes": "Sim",
    "sql.no": "Não",

    "cdcLog.show": "▾ Log do CDC",
    "cdcLog.hide": "▴ Ocultar log do CDC",
    "cdcLog.title": "O que o CDC do SQL Server realmente registra",
    "cdcLog.explanation":
      "Toda mudança numa tabela com CDC habilitado é gravada aqui primeiro, nas tabelas de mudança cdc.<tabela>_CT — esse é exatamente o stream cru que o CDC Sink do RavenDB monitora e transforma em atualizações de documento. Só Pets, People, e os filhos embutidos de Pets (Prontuários Médicos, Vacinações, Candidaturas de Adoção) realmente chegam no RavenDB; Employees/Veterinarians/Clinics/Adoptions também têm CDC habilitado, mas nada assina essas tabelas.",
    "cdcLog.colTable": "Tabela",
    "cdcLog.colOperation": "Mudança",
    "cdcLog.colRecord": "Registro",
    "cdcLog.colWhen": "Quando",
    "cdcLog.opInsert": "Inserção",
    "cdcLog.opUpdate": "Atualização",
    "cdcLog.opDelete": "Exclusão",
    "cdcLog.empty": "Nenhuma atividade de CDC registrada ainda — edite algo numa tabela acima, ou espere um instante o CDC Sink alcançar.",
    "cdcLog.loading": "Carregando log do CDC…",

    "hint.cdcCapture": "Liga/desliga o job de captura CDC do SQL Server — pausa a replicação instantaneamente sem tocar nos dados, pra você demonstrar \"CDC desligado\" vs. \"CDC ligado\" ao vivo.",
    "hint.cdcSink": "A task que lê o stream de CDC do SQL Server e transforma cada mudança num documento do RavenDB — o núcleo de toda essa demo.",
    "hint.genAi": "Escreve uma bio de adoção e tags de temperamento geradas por IA em cada pet resgatado, a partir das anotações cruas de entrada.",
    "hint.embeddings": "Transforma a descrição escrita por IA de cada pet num vetor, pra barra de busca do portal conseguir casar com linguagem natural tipo \"cachorro calmo, bom com crianças\".",
    "hint.agent": "O concierge via chat — consegue buscar pets disponíveis e registrar um interesse de adoção de verdade em nome de um visitante.",

    "raven.panelTitle": "Portal de Adoção",
    "raven.connectionSettingsTitle": "Configurar conexão do RavenDB",
    "raven.statPetsTreated": "Pets atendidos por esta clínica",
    "raven.statAvailable": "Disponíveis para adoção",
    "raven.statQueryTime": "Tempo de consulta",
    "raven.statQueryTimeSub": "(índice estático)",
    "raven.statTokens": "Tokens de IA gastos nesta sessão",
    "raven.chartSpecies": "Pets por espécie",
    "raven.chartOrigin": "Próprio vs. resgatado",
    "raven.chartStatus": "Pets por status",
    "raven.chartPulse": "Atividade do CDC ao vivo",
    "raven.chartTemperament": "Temperamento dos pets disponíveis (gerado por IA)",
    "raven.chartTemperamentEmpty": "Ainda sem tags de temperamento geradas por IA — enriqueça alguns pets primeiro.",
    "raven.chartTimeline": "Cronologia resgate-até-adoção",
    "raven.chartTimelineEmpty": "Ainda não há atividade datada suficiente para montar uma cronologia.",
    "raven.timelineRescues": "Resgates",
    "raven.timelineVisits": "Consultas médicas",
    "raven.timelineVaccinations": "Vacinações",
    "raven.timelineAdoptions": "Adoções aprovadas",
    "raven.pulseLegend": "Mudanças em documentos",
    "raven.meetNextPet": "Conheça seu próximo pet",
    "raven.askConcierge": "💬 Perguntar ao Concierge",
    "raven.searchPlaceholder": "Descreva o pet perfeito… ex: 'cachorro calmo, bom com crianças'",
    "raven.semanticSearch": "Busca semântica",
    "raven.allAvailablePets": "Todos os pets disponíveis",
    "raven.loadingPets": "Carregando pets…",
    "raven.noPetsMatched": "Nenhum pet encontrado — tente outras palavras.",
    "raven.mixedBreed": "Raça mista",
    "raven.bioPending": "Bio de IA ainda não gerada — volte em instantes.",
    "raven.askAbout": "Perguntar ao concierge sobre {name} →",
    "raven.vaccinated": "✓ Vacinado ({vaccine})",
    "raven.vaccinatedNoName": "✓ Vacinado",
    "raven.notVaccinated": "Sem vacinas registradas ainda",
    "raven.vetVisits": "{count} consulta{plural} veterinária{plural}",
    "raven.toggleCdcSink": "CDC Sink",
    "raven.toggleGenAi": "Enriquecimento GenAI",
    "raven.toggleEmbeddings": "Embeddings",
    "raven.toggleAgent": "Adoption Concierge",
    "raven.clearButton": "🧹 Limpar RavenDB",
    "raven.clearButtonBusy": "Limpando…",
    "raven.clearConfirm":
      "Isso exclui todo documento e coleção no RavenDB (incluindo coleções de sistema como @embeddings e @cdc-states) e desliga CDC Sink, GenAI, Embeddings e o Adoption Concierge. Continuar?",
    "raven.clearFailed": "Falha ao limpar o RavenDB.",
    "raven.errorPrefix": "Erro: {message}",
    "chat.title": "🐾 Adoption Concierge",
    "chat.close": "Fechar chat",
    "chat.empty":
      "Me conte o que você procura — porte, temperamento, nível de energia — e eu te ajudo a achar o pet certo, e registro seu interesse com o abrigo quando você quiser.",
    "chat.thinking": "Pensando…",
    "chat.placeholder": "Digite uma mensagem… (Markdown funciona — Shift+Enter pra pular linha)",
    "chat.send": "Enviar",

    "sqlReset.button": "↺ Resetar dados do SQL Server",
    "sqlReset.buttonBusy": "Resetando…",
    "sqlReset.confirm":
      "Isso restaura o SQL Server pros dados originais de seed (desfazendo tudo que foi adicionado ou alterado durante a demo) e desliga o CDC Sink. Continuar?",
    "sqlReset.failed": "Falha ao resetar os dados do SQL Server.",
    "cdcToggle.on": "Captura de CDC: ligada",
    "cdcToggle.off": "Captura de CDC: desligada",
    "cdcToggle.updating": "Atualizando…",

    "modal.close": "Fechar",
    "modal.save": "Salvar",
    "modal.saving": "Salvando…",
    "modal.provisioning": "Provisionando… isso pode levar um minuto",
    "modal.loading": "Carregando configurações atuais…",
    "modal.hintFooter": "(exibido no rodapé)",
    "sqlModal.title": "Conexão do SQL Server",
    "sqlModal.host": "Host",
    "sqlModal.port": "Porta",
    "sqlModal.database": "Banco de dados",
    "sqlModal.user": "Usuário",
    "sqlModal.password": "Senha",
    "sqlModal.passwordPlaceholder": "Deixe em branco para manter a senha atual",
    "sqlModal.environment": "Rótulo do ambiente",
    "sqlModal.provisionCheckbox": "Provisionar o ambiente completo neste servidor (criar o banco, schema, dados de seed, e habilitar o CDC)",
    "sqlModal.connectedTo": "Conectado a {host}:{port}/{database}.",
    "sqlModal.databaseCreated": "Banco de dados criado.",
    "sqlModal.databaseExisted": "Banco de dados já existia.",
    "sqlModal.seededSummary": "{rows} linhas inseridas em {tables} tabelas.",
    "sqlModal.cdcEnabled": "CDC habilitado.",
    "sqlModal.cdcFailed": "Não foi possível habilitar o CDC: {error}",
    "ravenModal.title": "Conexão do RavenDB",
    "ravenModal.url": "URL",
    "ravenModal.environment": "Rótulo do ambiente",
    "ravenModal.provisionCheckbox": "Provisionar o ambiente completo neste servidor (banco, CDC Sink, GenAI, Embeddings, SQL ETL, Agent, índice)",
    "ravenModal.apiKey": "Chave de API da OpenAI",
    "ravenModal.apiKeyHint": "(opcional — deixe em branco pra manter as connection strings de IA existentes)",
    "ravenModal.chatModel": "Modelo de chat",
    "ravenModal.embeddingModel": "Modelo de embedding",
    "ravenModal.connectedTo": "Conectado a {url}/{database}.",
    "ravenModal.databaseCreated": "Banco de dados criado.",
    "ravenModal.databaseExisted": "Banco de dados já existia.",
    "ravenModal.aiCreated": "Connection strings de IA criadas.",
    "ravenModal.provisionedSummary": "CDC Sink, GenAI, Embeddings, SQL ETL, Agent, e o índice do dashboard estão provisionados.",
  },
};

// SQL admin panel table/column labels — a frontend-only override layer.
// The backend (web/schema/tables.js) always serves English labels (it's the
// single source of truth the server also uses for parameter validation), so
// translation happens here, keyed by the same technical table/column names,
// and only applied when locale is "pt".
const SQL_LABELS_PT = {
  Clinics: {
    _label: "Clínicas",
    _singular: "Clínica",
    _gender: "f",
    ClinicId: "ID",
    Name: "Nome",
    AddressLine: "Endereço",
    City: "Cidade",
    State: "Estado",
    Country: "País",
    Phone: "Telefone",
    Email: "E-mail",
  },
  Employees: {
    _label: "Funcionários",
    _singular: "Funcionário",
    _gender: "m",
    EmployeeId: "ID",
    ClinicId: "Clínica",
    FullName: "Nome completo",
    Department: "Departamento",
    JobTitle: "Cargo",
    Email: "E-mail",
    Phone: "Telefone",
    HiredDate: "Data de contratação",
  },
  Veterinarians: {
    _label: "Veterinários",
    _singular: "Veterinário",
    _gender: "m",
    VeterinarianId: "ID",
    EmployeeId: "Funcionário",
    LicenseNumber: "Número da licença",
    Specialty: "Especialidade",
    YearsOfExperience: "Anos de experiência",
  },
  People: {
    _label: "Pessoas",
    _singular: "Pessoa",
    _gender: "f",
    PersonId: "ID",
    FullName: "Nome completo",
    Email: "E-mail",
    Phone: "Telefone",
    AddressLine: "Endereço",
    City: "Cidade",
    State: "Estado",
    Country: "País",
    DocumentId: "Documento (CPF/ID)",
  },
  Pets: {
    _label: "Pets",
    _singular: "Pet",
    _gender: "m",
    PetId: "ID",
    Name: "Nome",
    Species: "Espécie",
    Breed: "Raça",
    Sex: "Sexo",
    DateOfBirthEstimate: "Data de nascimento (estimada)",
    Color: "Cor",
    Origin: "Origem",
    ClinicId: "Clínica",
    OwnerId: "Dono / tutor",
    RescueDate: "Data do resgate",
    ShelterLocation: "Local do abrigo",
    IntakeNotes: "Anotações de entrada",
    Status: "Status",
  },
  MedicalRecords: {
    _label: "Prontuários Médicos",
    _singular: "Prontuário Médico",
    _gender: "m",
    MedicalRecordId: "ID",
    PetId: "Pet",
    VeterinarianId: "Veterinário",
    VisitDate: "Data da consulta",
    ReasonForVisit: "Motivo da consulta",
    Symptoms: "Sintomas",
    Diagnosis: "Diagnóstico",
    Treatment: "Tratamento",
    WeightKg: "Peso (kg)",
    FollowUpDate: "Data de retorno",
  },
  Vaccinations: {
    _label: "Vacinações",
    _singular: "Vacinação",
    _gender: "f",
    VaccinationId: "ID",
    PetId: "Pet",
    VeterinarianId: "Veterinário",
    VaccineName: "Vacina",
    DateAdministered: "Data de aplicação",
    NextDoseDate: "Data da próxima dose",
  },
  AdoptionApplications: {
    _label: "Candidaturas de Adoção",
    _singular: "Candidatura de Adoção",
    _gender: "f",
    ApplicationId: "ID",
    PetId: "Pet",
    ApplicantId: "Candidato",
    HandledByEmployeeId: "Atendido por",
    ApplicationDate: "Data da candidatura",
    Status: "Status",
    Notes: "Anotações",
    DecisionDate: "Data da decisão",
    Source: "Origem",
    ExternalId: "Documento de origem no RavenDB (ID externo)",
    ExternalApplicantName: "Nome do candidato (portal)",
    ExternalApplicantEmail: "E-mail do candidato (portal)",
    ExternalApplicantPhone: "Telefone do candidato (portal)",
  },
  PortalAdoptionRequests: {
    _label: "Solicitações de Adoção do Portal",
    _singular: "Solicitação de Adoção do Portal",
    _gender: "f",
    PortalAdoptionRequestId: "ID",
    ExternalId: "Documento de origem no RavenDB (ID externo)",
    PetId: "Pet",
    PetName: "Nome do pet (como enviado)",
    ApplicantName: "Nome do candidato",
    ApplicantEmail: "E-mail do candidato",
    ApplicantPhone: "Telefone do candidato",
    Notes: "Anotações",
    RequestedAt: "Solicitado em",
    ReceivedAt: "Recebido em",
  },
  Adoptions: {
    _label: "Adoções",
    _singular: "Adoção",
    _gender: "f",
    AdoptionId: "ID",
    ApplicationId: "Candidatura",
    PetId: "Pet",
    AdopterId: "Adotante",
    AdoptionDate: "Data da adoção",
    ProcessedByEmployeeId: "Processado por",
    IncludedVetCheckup: "Incluiu checkup veterinário",
    CheckupMedicalRecordId: "Checkup pré-adoção",
  },
};

function translateTableLabel(locale, tableName, fallbackLabel) {
  if (locale !== "pt") return fallbackLabel;
  const entry = SQL_LABELS_PT[tableName];
  return (entry && entry._label) || fallbackLabel;
}

function translateColumnLabel(locale, tableName, columnName, fallbackLabel) {
  if (locale !== "pt") return fallbackLabel;
  const entry = SQL_LABELS_PT[tableName];
  return (entry && entry[columnName]) || fallbackLabel;
}

// Portuguese grammatical gender agreement ("Novo"/"Nova", "este"/"esta") can't
// be derived by stripping a trailing "s" the way the English singular can
// (and several table labels are multi-word phrases like "Candidatura de
// Adoção", where the plural marker isn't even on the last word) — so the
// singular form and gender are looked up explicitly per table instead.
function singularTableLabel(locale, tableName, fallbackSingular) {
  if (locale !== "pt") return fallbackSingular;
  const entry = SQL_LABELS_PT[tableName];
  return (entry && entry._singular) || fallbackSingular;
}

function tableGender(tableName) {
  const entry = SQL_LABELS_PT[tableName];
  return (entry && entry._gender) || "m";
}

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? vars[key] : match));
}

const I18nContext = React.createContext(null);

function I18nProvider({ children }) {
  const [locale, setLocale] = React.useState(() => localStorage.getItem("demo-locale") || "en");

  React.useEffect(() => {
    localStorage.setItem("demo-locale", locale);
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
  }, [locale]);

  const t = React.useCallback(
    (key, vars) => interpolate((STRINGS[locale] && STRINGS[locale][key]) || STRINGS.en[key] || key, vars),
    [locale]
  );

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      t,
      tTable: (tableName, fallbackLabel) => translateTableLabel(locale, tableName, fallbackLabel),
      tColumn: (tableName, columnName, fallbackLabel) => translateColumnLabel(locale, tableName, columnName, fallbackLabel),
      tSingular: (tableName, fallbackSingular) => singularTableLabel(locale, tableName, fallbackSingular),
      tGender: (tableName) => tableGender(tableName),
    }),
    [locale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n() {
  return React.useContext(I18nContext);
}
