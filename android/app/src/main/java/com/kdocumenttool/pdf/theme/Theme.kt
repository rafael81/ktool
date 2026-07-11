package com.kdocumenttool.pdf.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors =
  lightColorScheme(
    primary = Navy,
    onPrimary = Color.White,
    primaryContainer = SoftBlue,
    onPrimaryContainer = Ink,
    background = WarmBackground,
    onBackground = Ink,
    surface = Paper,
    onSurface = Ink,
    error = Color(0xFFB3261E),
  )

private val DarkColors =
  darkColorScheme(
    primary = NavyDark,
    onPrimary = Color(0xFF063D3D),
    primaryContainer = Color(0xFF174F4F),
    onPrimaryContainer = Color(0xFFD7F0ED),
    background = DarkBackground,
    onBackground = Color(0xFFE2E2E6),
    surface = DarkSurface,
    onSurface = Color(0xFFE2E2E6),
  )

@Composable
fun KDocumentPdfTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit,
) {
  MaterialTheme(
    colorScheme = if (darkTheme) DarkColors else LightColors,
    typography = AppTypography,
    content = content,
  )
}
