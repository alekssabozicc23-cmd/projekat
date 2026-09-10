export const digitsOnly = (v = "") => v.replace(/\D/g, "");

export const normalizeSrPhone = (phone = "") => {
  const d = digitsOnly(phone);
  if (!d) return "";
  if (d.startsWith("381")) return `+${d}`;
  if (d.startsWith("0")) return `+381${d.slice(1)}`;
  return `+${d}`;
};

export const viberLink = (settings) => {
  const num = normalizeSrPhone(settings?.phone);
  if (num) return `viber://chat?number=${encodeURIComponent(num)}`;
  return settings?.viber || "#kontakt";
};

export const whatsappLink = (settings, text) => {
  const num = digitsOnly(normalizeSrPhone(settings?.phone));
  if (!num) return settings?.whatsapp || "#kontakt";
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};
