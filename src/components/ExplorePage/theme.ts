// -----------------------------------------------------------------------------

export type TExploreTheme = 'default' | 'contrast';

// -----------------------------------------------------------------------------

const defaultTheme: object = {
  checkbox: {
    styles: {
      base: {        
        label: {
          color: 'text-gray-900',
          fontWeight: 'font-normal',
        },
      },
    },
  },

  tabsHeader: {
    defaultProps: {
      className: 'flex-wrap',
    },
  },

  tabPanel: {
    styles: {
      base: {        
        p: 'p-0',
      },
    },
  },

  tab: {
    styles: {
      base: {
        tab: {
          initial: {
            width: 'w-28',
          },
        },

      },
    },
  },

}

// Define high contrast styles for Material Tailwind components.
const contrastTheme: object = {
  ...defaultTheme,

  checkbox: {
    styles: {
      base: {
        input: {
          borderColor: 'border-black',
        }
      }
    }
  },

  input: {
    styles: {
      variants: {
        outlined: {
          colors: {
            input: {
              blue: {
                color: 'text-black',
                borderColor: 'border-black',
                borderColorFocused: 'focus:border-black',
              }
            },
            label: {
              blue: {
                color: '!text-black peer-focus:text-black',
                before: 'before:border-black peer-focus:before:!border-black',
                after: 'after:border-black peer-focus:after:!border-black',
              }
            }              
          }
        }
      }
    }
   }
};

// -----------------------------------------------------------------------------

export const exploreThemes: { [key in TExploreTheme]: object } = {
    'default': defaultTheme,
    'contrast': contrastTheme
}

// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
