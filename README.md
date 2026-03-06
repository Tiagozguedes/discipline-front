# Discipline

**Plataforma pessoal de produtividade e disciplina** — controle de tarefas, pomodoro, hábitos, finanças e agenda em um único painel com identidade visual consistente.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?logo=springboot&logoColor=white)

---

## Funcionalidades

| Módulo | Descrição |
|---|---|
| **Dashboard** | Discipline Score, progresso consolidado de tarefas, hábitos e finanças |
| **Pomodoro** | Timer com foco, pausa curta e longa, contagem de ciclos e estatísticas diárias |
| **Tarefas (Kanban)** | Drag & drop entre colunas (A Fazer → Em Progresso → Concluído), prioridades e subtarefas |
| **Agenda** | Calendário mensal com eventos coloridos, painel lateral de detalhes por dia |
| **Hábitos** | Toggle instantâneo (optimistic UI), heatmap semanal clicável, streaks |
| **Financeiro** | Transações, investimentos, gráficos de alocação (pie/bar charts) |

## Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** — estilização utility-first
- **shadcn/ui** — componentes base (New York style, zinc palette)
- **@dnd-kit** — drag & drop acessível para o Kanban
- **Recharts** — gráficos financeiros (PieChart, BarChart)
- **Lucide React** — ícones
- **React Router DOM** — navegação SPA

### Backend
- **Java 17** + **Spring Boot 3.4**
- **Spring Data JPA** + **SQLite** (banco leve, zero config)
- **Lombok** — redução de boilerplate
- **Hibernate Community Dialects** — suporte SQLite

## Tema & Identidade Visual

- Cor de destaque: **amarelo `#FABE00`**
- Suporte a **Dark Mode** e **Light Mode** com toggle na sidebar
- CSS variables semânticas para consistência entre temas
- Inspiração: plataformas como XP Investimentos e Notion

## Início Rápido

### Frontend

```bash
cd front-end/discipline-front
npm install
npm run dev
```

O frontend roda em `http://localhost:5173` por padrão.

### Backend

```bash
cd back-end/discipline-backend
mvn spring-boot:run
```

A API roda em `http://localhost:8080`. O banco SQLite é criado automaticamente.

### Docker (Backend)

```bash
cd back-end/discipline-backend
docker build -t discipline-backend .
docker run -p 8080:8080 discipline-backend
```

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL da API backend |
| `SPRING_DATASOURCE_URL` | `jdbc:sqlite:discipline.db` | Conexão do banco |

## Estrutura do Projeto

```
discipline/
├── front-end/discipline-front/
│   ├── src/
│   │   ├── components/    # UI components (shadcn/ui + layout)
│   │   ├── contexts/      # ThemeContext (dark/light)
│   │   ├── hooks/         # Custom hooks (useTheme)
│   │   ├── lib/           # API client, utils
│   │   ├── pages/         # Dashboard, Pomodoro, Tasks, Calendar, Habits, Finance
│   │   └── types/         # TypeScript interfaces compartilhadas
│   └── package.json
└── back-end/discipline-backend/
    ├── src/main/java/com/discipline/
    │   ├── controller/    # REST endpoints
    │   ├── dto/           # Data Transfer Objects
    │   ├── entity/        # JPA entities
    │   ├── repository/    # Spring Data repositories
    │   ├── service/       # Business logic
    │   └── config/        # CORS, exception handling
    └── pom.xml
```

## API Endpoints (Resumo)

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/dashboard` | Dados consolidados |
| `GET/POST` | `/api/tasks` | CRUD de tarefas |
| `PUT` | `/api/tasks/reorder` | Reordenar tarefas (batch) |
| `GET/POST` | `/api/habits` | CRUD de hábitos |
| `POST` | `/api/habits/{id}/toggle?date=` | Toggle completion |
| `GET/POST` | `/api/calendar` | CRUD de eventos |
| `GET/POST` | `/api/pomodoro` | Sessões pomodoro |
| `GET/POST` | `/api/finance/transactions` | Transações |
| `GET/POST` | `/api/finance/investments` | Investimentos |

## Deploy

O frontend está configurado para deploy no **GitHub Pages**:

```bash
npm run deploy
```

---

**Discipline** — Foco. Consistência. Resultados.
