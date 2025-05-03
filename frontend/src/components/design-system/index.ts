/**
 * Design System - Componentes
 *
 * Este arquivo exporta todos os componentes do Design System para uso no projeto.
 * Os componentes são construídos usando os tokens de design para garantir consistência visual.
 */

import Button, { ButtonProps, ButtonVariant, ButtonSize } from './Button'
import Card, { CardProps, CardVariant } from './Card'
import Typography, {
  TypographyProps,
  TypographyVariant,
  TypographyColor,
  TypographyAlign,
  TypographyWeight,
} from './Typography'
import Input, { InputProps, InputVariant, InputSize } from './Input'
import Select, {
  SelectProps,
  SelectVariant,
  SelectSize,
  SelectOption,
} from './Select'

// Exportar tipos
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  CardProps,
  CardVariant,
  TypographyProps,
  TypographyVariant,
  TypographyColor,
  TypographyAlign,
  TypographyWeight,
  InputProps,
  InputVariant,
  InputSize,
  SelectProps,
  SelectVariant,
  SelectSize,
  SelectOption,
}

// Exportar componentes
export { Button, Card, Typography, Input, Select }

// Por padrão, exportar todos os componentes
export default {
  Button,
  Card,
  Typography,
  Input,
  Select,
}
