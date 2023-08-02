import MarkdownIt from 'markdown-it'
import mdContainer from 'markdown-it-container'

export const generateVideoHtml = (src: string, mime?: string) => `
<video width="100%" height="auto" controls>
  <source src="${src}" type="${mime || 'video/mp4'}">
</video>
`

export const generateTweet = (tweetId: string | number) => `
<Tweet tweetId="${tweetId}" />
`

const spoiler = {
  validate: function (params: string) {
    return params.trim().match(/^spoiler\s+(.*)$/)
  },

  render: function (tokens: any, idx: any) {
    const m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/)

    if (tokens[idx].nesting === 1) {
      // opening tag
      return '<details><summary>' + mdParser.utils.escapeHtml(m[1]) + '</summary>\n'
    } else {
      // closing tag
      return '</details>\n'
    }
  }
}

const video = {
  validate: function (params: string) {
    return params.trim().match(/^video+(.*)$/)
  },

  render: function (tokens: any, idx: any) {
    const m = tokens[idx].info.trim().match(/^video+(.*)$/)

    if (tokens[idx].nesting === 1) {
      // opening tag
      let a = '<video width="auto" height="auto" controls>\n'
      a += `<source src="${mdParser.utils.escapeHtml(m[1])}" type="video/mp4">\n</video>`
      return a
    } else {
      // closing tag
      return '</video>\n'
    }
  }
}

export const mdParser = new MarkdownIt({ html: true })
  .use(mdContainer, 'spoiler', spoiler)
  .use(mdContainer, 'video', video)
