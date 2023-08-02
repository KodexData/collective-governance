import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import StyledMenu from 'components/customs/StyledMenu'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import FlagDE from 'assets/images/de.svg'
import FlagUS from 'assets/images/us.svg'
import FlagFR from 'assets/images/fr.svg'

const LangMenu: React.FC = () => {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const flag = useMemo(() => {
    if (language.includes('fr')) return FlagFR
    if (language.includes('de')) return FlagDE
    return FlagUS
  }, [language])

  useEffect(() => {
    console.log({ language })
  }, [language])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div>
      <Tooltip title={t('Select another Language')} placement='bottom-end'>
        <Chip
          size={'small'}
          icon={<Avatar src={flag} sx={{ height: 20, width: 20, mr: 1 }} />}
          label={language.toUpperCase()}
          id='select-lang-button'
          aria-controls={open ? 'select-lang-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{ mr: 1, mt: -0.4 }}
        />
      </Tooltip>
      <StyledMenu
        id='select-editor-menu'
        MenuListProps={{
          'aria-labelledby': 'select-lang-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => i18n.changeLanguage('en')} disableRipple>
          <Avatar src={FlagUS} sx={{ height: 20, width: 20, mr: 1 }} />
          English
        </MenuItem>
        <MenuItem onClick={() => i18n.changeLanguage('de')} disableRipple>
          <Avatar src={FlagDE} sx={{ height: 20, width: 20, mr: 1 }} />
          Deutsch
        </MenuItem>
        <MenuItem onClick={() => i18n.changeLanguage('fr')} disableRipple>
          <Avatar src={FlagFR} sx={{ height: 20, width: 20, mr: 1 }} />
          Français
        </MenuItem>
      </StyledMenu>
    </div>
  )
}

export default LangMenu
