export function buildInviteMessage(clientName: string, slug: string, pin: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://galeria.dariuzph.com';
  return `¡Hola! Ya está lista tu galería virtual de ${clientName}. Puedes ver tus fotos y elegir tus 30 favoritas para retoque en tu enlace personal: ${baseUrl}/g/${slug} | Tu PIN de acceso como cliente es: ${pin}`;
}

export function buildSelectionMessage(
  clientDisplayName: string,
  sessionName: string,
  fileNames: string[]
): string {
  return `Hola Darius, soy ${clientDisplayName}. Ya elegí mis ${fileNames.length} fotos para retoque de la sesión ${sessionName}: ${fileNames.join(', ')}`;
}

export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
