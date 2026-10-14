import { addons } from 'storybook/internal/manager-api'
import { create } from 'storybook/internal/theming'

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Wild Talker UI',
    brandUrl: 'https://yemin11238.github.io/wild-talker/guide/design-system',
    brandTarget: '_blank',
    colorPrimary: '#708b42',
    colorSecondary: '#506b2b',
  }),
})
