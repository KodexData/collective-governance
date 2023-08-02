import darkScrollbar from '@mui/material/darkScrollbar'
import { createTheme } from '@mui/material'
import { red } from '@mui/material/colors'

const collectivePalette = [
  '#AED3F3',
  '#02131D',
  '#000000',
  '#51ABAE',
  '#FDF739',
  '#062768',
  '#3B5465',
  '#ffffff',
  '#DCEEFD'

]

export const theme = createTheme({
  typography: {
    allVariants: {
      fontWeight: 100,
      fontSize: '16px',
      fontFamily: 'Economica'
    },
    h1: {
      fontSize: '30px'
    },
    h2: {
      fontSize: '26px'
    },
    h3: {
      fontSize: '24px'
    },
    h4: {
      fontSize: '22px'
    },
    caption: {
      fontSize: '14px'
    }
  },
  palette: {
    mode: 'dark',
    primary: {
      main: collectivePalette[7]
    },
    secondary: {
      main: collectivePalette[2]
    },
    warning: {
      main: collectivePalette[4],
    },
    error: {
      main: red.A400
    },
    background: {
      default: collectivePalette[1],
      paper: collectivePalette[6]
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => ({
        //body: themeParam.palette.mode === 'dark' ? darkScrollbar() : null,
        body: {
          ...themeParam.palette.mode === 'dark' && darkScrollbar(),
          '&::-webkit-scrollbar': {
            height: 12,
            width: 12,
          },
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent!important',
          },
        }
      }),
      
    },
    MuiAppBar: {
      defaultProps: { position: 'sticky', elevation: 0 },
      styleOverrides: {
        root: {
          //fontWeight: 400,
          fontFamily: 'Economica'
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: collectivePalette[7]
        }
      }
    },
    MuiToolbar: {},
    MuiChip: {
      styleOverrides: {
        label: {
          fontSize: '18px',
          fontWeight: 400,
          fontFamily: 'Economica',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '33vw'
        },
        labelMedium: {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '33vw'
        },
        labelSmall: {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '33vw'
        }
      }
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
        sx: {
          padding: '1em'
        }
      }
    },
    MuiDivider: {
      defaultProps: {
        style: {
          marginTop: '0.61em',
          marginBottom: '0.61em'
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        sx: { mt: 0.5, mb: 1.5 }
      }
    },
    MuiTable: {
      defaultProps: {
        style: {
          background: 'transparent !important'
        }
      }
    },
    MuiTypography: {
      defaultProps: {
        style: {
          color: collectivePalette[7]
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        style: {
          borderRadius: '3px!important'
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        button: {
          color: '#ECEFF1 !important',
          ':hover': { color: '#B9364B !important' }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: `#fff !important`
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '12px',
          background: 'black !important',
          color: 'white !important',
          rippleBackgroundColor: 'black !important'
        },
        arrow: {
          color: 'black !important',
          fontColor: 'black !important'
        }
      }
    }
  }
})

export default theme
