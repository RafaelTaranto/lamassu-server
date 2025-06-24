const defaultMaterialTableOpts = {
  enableKeyboardShortcuts: false,
  enableGlobalFilter: false,
  paginationDisplayMode: 'pages',
  enableColumnActions: false,
  initialState: { density: 'compact' },
  mrtTheme: it => ({
    ...it,
    baseBackgroundColor: '#fff',
  }),
  muiTopToolbarProps: () => ({
    sx: {
      backgroundColor: 'var(--zodiac)',
      '& .MuiButtonBase-root': { color: '#fff' },
    },
  }),
  muiTableHeadRowProps: () => ({
    sx: { backgroundColor: 'var(--zircon)' },
  }),
}

const alignRight = {
  muiTableHeadCellProps: {
    align: 'right',
  },
  muiTableBodyCellProps: {
    align: 'right',
  },
  muiTableFooterCellProps: {
    align: 'right',
  },
}

export { defaultMaterialTableOpts, alignRight }
