import { t } from 'i18next'

import TokenMintingWizardView from 'views/TokenMintingWizardView'
import GovernancePlayground from 'views/GovernancePlayground'
import ActiveProposals from 'views/ActiveProposals'
import SetupWizardView from 'views/SetupWizardView'
import ContractTooling from 'views/ContractTooling'
import ProposalEditor from 'views/ProposalEditor'
import ProposalViewer from 'views/ProposalViewer'
import DaoWrapperView from 'views/DaoWrapperView'
import DashboardView from 'views/DashboardView'
import SetupView from 'views/SetupView'

import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ViewCompactIcon from '@mui/icons-material/ViewCompact'
import DashboardIcon from '@mui/icons-material/Dashboard'
import WrapTextIcon from '@mui/icons-material/WrapText'
import SecurityIcon from '@mui/icons-material/Security'
import AddLinkIcon from '@mui/icons-material/AddLink'
import BlurOnIcon from '@mui/icons-material/BlurOn'
import EditIcon from '@mui/icons-material/Edit'

const routes: RouteType[] = [
  {
    name: 'Collective Governance Playground',
    path: '/',
    cat: 'main',
    icon: DashboardIcon,
    Component: GovernancePlayground,
    description: 'Collective Governance Playground (Home) refers to the main interface or landing page of a decentralized platform or organization that provides stakeholders with access to various tools and features related to decentralized decision-making and management, such as proposal creation, voting, and governance dashboard.'
  },
  {
    name: t('Active Proposals'),
    path: '/active',
    cat: 'main',
    icon: NotificationsActiveIcon,
    Component: ActiveProposals,
    description: 'Active Proposals refer to the proposals that are currently under consideration and open for voting within a decentralized platform or organization, typically displaying relevant information such as proposal details, voting status, and deadline for voting.'
  },
  {
    name: t(`Create New Proposal`),
    path: '/editor',
    cat: 'main',
    icon: EditIcon,
    Component: ProposalEditor,
    description: 'Proposal Editor is a software tool that enables users to create, edit, and submit proposals for decision-making within a decentralized platform or organization, typically providing a user-friendly interface for inputting proposal details and attaching relevant documentation.',
    hideSidebar: true,
  },
  {
    name: t('Token Minting Wizard'),
    path: '/token-wizard',
    cat: 'main',
    icon: BlurOnIcon,
    Component: TokenMintingWizardView,
    description: 'Token Minting Wizard is a software tool that enables users to create a new proposal for minting tokens using the same ERC20 standard within a decentralized platform or organization.'
  },
  {
    name: 'PROPOSAL',
    path: '/proposal',
    params: ':id',
    cat: 'main',
    icon: ViewCompactIcon,
    Component: ProposalViewer,
    description: 'Proposal Viewer is a software tool that enables users to view proposals submitted for decision-making within a decentralized organization or platform, providing access to relevant information such as proposal details, voting results, and comments from other stakeholders.',
    hideSidebar: true,
  },
  {
    name: t('Collective Governance Dashboard'),
    path: '/dashboard',
    cat: 'main',
    icon: DashboardIcon,
    Component: DashboardView,
    description: 'Collective Governance Dashboard refers to a user interface or platform designed to provide stakeholders with an overview of the decentralized decision-making and management processes of a community or organization, including voting results, proposal status, and other relevant information related to governance activities.',
    hideSidebar: true,
  },
  {
    name: t('Setup Network and Governance Contract'),
    path: '/link',
    params: ':chainId/:contract/:id?',
    cat: 'main',
    icon: AddLinkIcon,
    Component: SetupView,
    description: 'This tool will automatically direct you to the proposal creation process after setting up the network and governance contract for a decentralized platform or organization.'
  },
  {
    name: t('Initial Governance Setup Proposal Wizard'),
    path: '/setup',
    cat: 'main',
    icon: SettingsApplicationsIcon,
    Component: SetupWizardView,
    description: 'Initial Governance Setup Proposal Wizard is a software tool that guides users through the process of creating and submitting a proposal for the initial setup of governance mechanisms within a decentralized platform or organization.'
  },
  {
    name: 'Wrap existing ERC20 Token to a new DAO-Token',
    path: '/wrapper',
    params: ':wrappedAddress',
    cat: 'main',
    icon: WrapTextIcon,
    Component: DaoWrapperView,
    description: 'This refers to the conversion of an ERC20 token into a new DAO token, enabling its use within a decentralized autonomous organization.'
  },
  {
    name: 'Collective Governance Contract Tools',
    path: '/contract',
    cat: 'main',
    icon: SecurityIcon,
    Component: ContractTooling,
    description: 'This tool enables easy reading and writing of EVM contracts using input ABI. (Application Binary Interface)',
    hideSidebar: true,
  },
]

export default routes
