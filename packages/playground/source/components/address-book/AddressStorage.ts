import type { AddressInformation } from 'types'

export default class AddressStorage {
  static isItem(obj: any): obj is AddressInformation {
    return obj && 'type' in obj && 'hash' in obj
  }
  data: AddressInformation[] = []
  get key() {
    if (!this.chainId) return ''
    return `dc_address-book-${this.chainId}`
  }

  constructor(public chainId?: number) {
    this.load()
  }

  dump() {
    if (!this.chainId) return
    localStorage.setItem(this.key, JSON.stringify(this.data))
  }

  load() {
    if (!this.chainId) return
    const content = localStorage.getItem(this.key)
    if (!content) return
    try {
      const parsed = JSON.parse(content)
      if (!Array.isArray(parsed)) {
        throw new Error(`given address storage data is not an array`)
      }

      if (parsed[0] && !AddressStorage.isItem(parsed[0])) {
        throw new Error(`given object is not a valid address information object`)
      }

      this.data = parsed
    } catch (error) {
      console.error(error, content)
    }
  }

  add(...items: AddressInformation[]) {
    for (const item of items) {
      const i = this.data.findIndex(d => d.hash === item.hash)
      if (i > -1) {
        this.data[i] = item
      } else {
        this.data.push(item)
      }
    }

    this.dump()
  }
}
