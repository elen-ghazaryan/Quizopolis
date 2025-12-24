export const gradients = [
  "linear-gradient(135deg, #a691e1 0%, #f3ed6f 100%)",
  "linear-gradient(135deg, #60a5fa 0%, #34d399 100%)",
  "linear-gradient(135deg, #f472b6 0%, #fb7185 100%)",
  "linear-gradient(135deg, #facc15 0%, #fb923c 100%)",
  "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
  "linear-gradient(135deg, #636dceff 0%, #c084fc 100%)",
  "linear-gradient(135deg, #f881eeff 0%, #f7caf4ff 100%)",
  "linear-gradient(135deg, #81f8f2ff 0%, #fff383ff 100%)",
  "linear-gradient(135deg, #f88981ff 0%, #ec4343ff 100%)",
  "linear-gradient(135deg, #de69e2ff 0%, #bd83ffff 100%)",
  "linear-gradient(135deg, #9a92e2ff 0%, #21286eff 100%)",
];

export const pickGradient = (id: string) => {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  return gradients[Math.abs(hash) % gradients.length];
};
