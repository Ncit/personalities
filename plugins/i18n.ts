import { createI18n } from 'vue-i18n'
import ru from '~/locales/ru'
import en from '~/locales/en'

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'ru',
    fallbackLocale: 'ru',
    messages: {
      ru,
      en
    }
  })

  vueApp.use(i18n)

  return {
    provide: {
      i18n
    }
  }
})
