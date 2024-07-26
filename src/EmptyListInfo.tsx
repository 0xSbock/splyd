import { Box, Typography } from '@mui/material'

interface EmptyListInfoInterface {
  heading: string
  info: string
}
const EmptyListInfo = ({ heading, info }: EmptyListInfoInterface) => (
  <Box component="section" sx={{ p: 2 }}>
    <Typography variant="h4" gutterBottom>
      {heading}
    </Typography>
    <Typography variant="subtitle1" gutterBottom>
      {info}
    </Typography>
  </Box>
)

export default EmptyListInfo
