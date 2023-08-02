import type { CommonProps } from '@mui/material/OverridableComponent'
import type { TweetProps } from 'react-twitter-widgets'
import type { SxProps, Theme } from 'types'
import ReactMarkdown from 'markdown-to-jsx'
import Prism from 'prismjs'
import YAML from 'js-yaml'
import clsx from 'clsx'
import { useEffect, useMemo } from 'react'
import { useTheme, useClipboard, useTranslation } from 'hooks'
import { Tweet } from 'react-twitter-widgets'
import { formatAllValues } from 'utils'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'

import 'prismjs/components/prism-textile'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-solidity'
import 'prismjs/components/prism-graphql'

import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-toml'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-ebnf'

import 'assets/css/MarkdownFix.css'
import 'assets/css/github-markdown.css'
import 'assets/css/prism.css'

export type OutputFormats = 'YAML' | 'JSON'

function MarkdownListItem(props: any) {
  return <Box component='li' sx={{ mt: 1, typography: 'body1' }} {...props} />
}

const styles = (theme: Theme) => ({
  listItem: {
    marginTop: theme.spacing(1),
    '&:before': {
      color: theme.palette.primary.main + '!important'
    }
  },
  link: {
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'underline',
      textDecorationColor: theme.palette.primary.main
    }
  },
  twitter: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginRight: 'auto',
    marginLeft: 'auto'
  },
  quote: {
    padding: '3em',
    backgroundColor: 'grey'
  }
})

const options = {
  overrides: {
    h1: {
      component: Typography,
      props: {
        gutterBottom: true,
        variant: 'h4',
        component: 'h1'
      }
    },
    h2: {
      component: Typography,
      props: { gutterBottom: true, variant: 'h6', component: 'h2' }
    },
    h3: {
      component: Typography,
      props: { gutterBottom: true, variant: 'subtitle1' }
    },
    h4: {
      component: Typography,
      props: {
        gutterBottom: true,
        variant: 'caption',
        paragraph: true
      }
    },
    p: {
      component: Typography,
      props: { paragraph: true }
    },
    a: {
      component: Link,
      props: {
        target: '_blank'
      }
    },
    li: {
      component: MarkdownListItem
    },
    hr: {
      component: Divider
    },
    Tweet: {
      //@ts-ignore
      component: ({ classes, ...props }: TweetProps) => {
        const theme = useTheme()
        return (
          <span className={classes.twitter}>
            <Tweet
              {...props}
              options={{
                theme: theme.palette.mode
              }}
            />
          </span>
        )
      }
    }
  }
}

interface MarkdownProps extends CommonProps {
  [key: string]: any
  markdown?: string
  children: string
}

export const Markdown: React.FC<MarkdownProps> = (props) => {
  const { t } = useTranslation()
  const clipboard = useClipboard()

  function cleanContent(content: string) {
    const lines = content.split('\n')
    const last = lines.length - 1

    if (lines[0].startsWith('```') && lines[last].startsWith('```')) {
      content = lines.filter((_, index) => index !== 0 && index !== last).join('\n')
    }

    return content
  }

  function handleCopy() {
    const content = cleanContent(String(props.children || props.markdown))
    clipboard.copy(content, { disableNotification: true })
  }

  useEffect(() => {
    if (!Prism) return
    Prism.highlightAll()
  }, [props.markdown])

  useEffect(() => {
    Prism.highlightAll()
  })

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%'
      }}
    >
      <ReactMarkdown id='markdown_area' options={options} {...props} className={clsx('markdown-body', props.className)} />
      <IconButton size='small' sx={{ position: 'absolute', top: '5px', right: '5px' }} onClick={handleCopy}>
        <Tooltip title={t('Copy to Clipboard')} placement='bottom-end'>
          <ContentCopyIcon fontSize='small' />
        </Tooltip>
      </IconButton>
    </Box>
  )
}

interface MarkdownAreaProps {
  children: React.ReactNode
  paper?: boolean
  p?: number
  sx?: SxProps
  className?: string
}

export function toSolidityBlock(code: string) {
  return '```solidity\n' + code + '\n```'
}

export const MarkdownArea: React.FC<MarkdownAreaProps> = ({ children, paper, p, sx, className }) => (
  <Typography
    align='left'
    component='div'
    className={className || 'proposal-markdown'}
    sx={{ ...sx, bgcolor: paper ? 'background.paper' : 'background.default', p: p || 2, borderRadius: 4, opacity: 0.666 }}
  >
    <Markdown>{String(children)}</Markdown>
  </Typography>
)

function toTsBlock(code: string) {
  return '```ts\n' + code + '\n```'
}

interface MarkdownCommon extends CommonProps {
  code: string
}

export const TypescriptBox: React.FC<MarkdownCommon> = ({ code, className }) => (
  <Markdown className={className}>{toTsBlock(code)}</Markdown>
)

function toBashBlock(code: string) {
  return '```bash\n' + code + '\n```'
}

export const BashBox: React.FC<MarkdownCommon> = ({ code, className }) => (
  <Markdown className={className}>{toBashBlock(code)}</Markdown>
)

function toCliBlock(code: string) {
  return '```textile\n' + code + '\n```'
}

export const CliBox: React.FC<MarkdownCommon> = ({ code, className }) => (
  <Markdown className={className}>{toCliBlock(code)}</Markdown>
)

function toJsonBlock(code: string) {
  return '```json\n' + code + '\n```'
}

export const JsonBox: React.FC<MarkdownCommon> = ({ code, className, style }) => (
  <Markdown className={className} style={style}>
    {toJsonBlock(code)}
  </Markdown>
)

function toYamlBlock(code: string) {
  return '```yaml\n' + code + '\n```'
}

export const YamlBox: React.FC<MarkdownCommon> = ({ code, className }) => (
  <Markdown className={className}>{toYamlBlock(code)}</Markdown>
)

function toSqlBlock(code: string) {
  return '```sql\n' + code + '\n```'
}

export const SqlBox: React.FC<MarkdownCommon> = ({ code, className }) => (
  <Markdown className={className}>{toSqlBlock(code)}</Markdown>
)

export const FormatBox: React.FC<{ data?: any; format: OutputFormats } & CommonProps> = ({ data, format, style, className }) => {
  if (typeof data === 'undefined') return <></>

  const payload = useMemo(() => {
    if (data && format === 'YAML') {
      return YAML.dump(formatAllValues(data))
    }
    return JSON.stringify(formatAllValues(data), null, ' ').trim()
  }, [format])

  if (data && format === 'YAML') return <YamlBox code={payload} style={style} className={className} />
  return <JsonBox code={payload} style={style} className={className} />
}

export default Markdown
