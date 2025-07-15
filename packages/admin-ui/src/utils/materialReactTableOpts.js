const defaultMaterialTableOpts = {
  enableKeyboardShortcuts: false,
  enableGlobalFilter: false,
  paginationDisplayMode: 'pages',
  enableColumnActions: false,
  positionToolbarAlertBanner: 'bottom',
  initialState: { density: 'compact' },
  mrtTheme: it => ({
    ...it,
    baseBackgroundColor: '#fff',
  }),
  muiBottomToolbarProps: ({ table }) => ({
    sx: {
      '& .MuiPaper-root': {
        color: 'inherit',
        backgroundColor:
          table.getSelectedRowModel().flatRows.length > 0
            ? 'var(--ghost) !important'
            : 'var(--zodiac) !important',
      },
      '& .MuiButtonBase-root': {
        color:
          table.getSelectedRowModel().flatRows.length > 0
            ? 'var(--zodiac)'
            : '',
      },
    },
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
