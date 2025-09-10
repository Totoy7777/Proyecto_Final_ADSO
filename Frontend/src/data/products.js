const productsData = {
  computadores: {
    portatiles: [
      { name: "Laptop Lenovo", description: "Lenovo Ryzen 5, 16GB RAM, 512GB SSD" },
      { name: "Laptop Dell Inspiron", description: "Intel i7, 16GB RAM, 1TB HDD" },
      { name: "MacBook Air M1", description: "Chip M1, 8GB RAM, 256GB SSD" },
      { name: "HP Pavilion", description: "Ryzen 7, 16GB RAM, 512GB SSD" },
      { name: "Acer Nitro 5", description: "Gaming, RTX 3050, 16GB RAM" },
      { name: "Asus ZenBook", description: "Ultrabook, ligero y potente" },
    ],
    escritorio: [
      { name: "PC Gamer", description: "Intel i9, RTX 4060, 32GB RAM" },
      { name: "PC Oficina", description: "Intel i3, 8GB RAM, SSD 256GB" },
      { name: "PC Diseño Gráfico", description: "Ryzen 7, Quadro P2200, 32GB RAM" },
      { name: "All-in-One HP", description: "24 pulgadas, Core i5" },
      { name: "PC Compacto Lenovo", description: "Pequeño y eficiente" },
      { name: "Workstation Dell", description: "Xeon, 64GB RAM, para servidores" },
    ],
    accesorios: [
      { name: "Teclado Mecánico RGB", description: "Switch Red, retroiluminado" },
      { name: "Mouse Logitech G502", description: "Ergonómico y gamer" },
      { name: "Monitor Samsung Curvo 27\"", description: "Full HD, 144Hz" },
      { name: "Disco Duro Externo 2TB", description: "USB 3.0 portátil" },
      { name: "Base refrigerante", description: "Con ventiladores y luces LED" },
      { name: "Memoria USB 128GB", description: "Ultra rápida 3.1" },
    ],
  },

  celulares: {
    smartphones: [
      { name: "iPhone 14", description: "128GB, cámara dual" },
      { name: "Samsung Galaxy S23", description: "Pantalla AMOLED 120Hz" },
      { name: "Xiaomi Redmi Note 12", description: "Batería 5000mAh" },
      { name: "Motorola Edge 40", description: "Carga rápida 68W" },
      { name: "Google Pixel 7", description: "Android puro, cámara avanzada" },
      { name: "OnePlus 11", description: "Snapdragon 8 Gen 2, 16GB RAM" },
    ],
    basicos: [
      { name: "Nokia 110", description: "Teléfono clásico, batería duradera" },
      { name: "Alcatel 1", description: "Pantalla pequeña, económico" },
      { name: "Samsung Keystone", description: "Botones grandes, sencillo" },
      { name: "Nokia 3310", description: "Versión moderna del clásico" },
      { name: "Bmobile AX107", description: "Básico con linterna" },
      { name: "Blu Z5", description: "Práctico y económico" },
    ],
    accesorios: [
      { name: "Cargador Rápido 25W", description: "USB-C compatible" },
      { name: "Forro Transparente", description: "Silicona flexible" },
      { name: "Vidrio Templado 9H", description: "Alta resistencia" },
      { name: "Cargador Inalámbrico", description: "Carga rápida Qi" },
      { name: "Audífonos In-Ear", description: "Con micrófono" },
      { name: "Batería Portátil 20,000mAh", description: "Con carga rápida" },
    ],
  },

  tv: {
    led: [
      { name: "Samsung LED 43\"", description: "Resolución Full HD" },
      { name: "LG LED 55\"", description: "Con HDR" },
      { name: "Hisense 40\"", description: "Económica, buen contraste" },
      { name: "Sony Bravia 50\"", description: "Tecnología Triluminos" },
      { name: "TCL 65\"", description: "Pantalla grande y económica" },
      { name: "Philips 32\"", description: "Ideal para habitaciones pequeñas" },
    ],
    proyectores: [
      { name: "Proyector Epson", description: "Alta luminosidad" },
      { name: "Proyector BenQ", description: "Cine en casa" },
      { name: "Proyector LG", description: "Portátil con batería" },
      { name: "Proyector Xiaomi", description: "Resolución 4K" },
      { name: "Proyector Optoma", description: "Ideal para oficinas" },
      { name: "Proyector ViewSonic", description: "Compacto y versátil" },
    ],
    smart: [
      { name: "LG Smart TV 50\"", description: "WebOS integrado" },
      { name: "Sony Bravia 65\"", description: "Android TV" },
      { name: "Samsung QLED 55\"", description: "Colores vivos" },
      { name: "Philips Ambilight 58\"", description: "Iluminación envolvente" },
      { name: "TCL Roku TV 40\"", description: "SmartTV con Roku" },
      { name: "Hisense VIDAA 43\"", description: "Sistema operativo propio" },
    ],
  },

  audio: {
    audifonos: [
      { name: "Sony WH-1000XM4", description: "Cancelación de ruido" },
      { name: "AirPods Pro", description: "Inalámbricos" },
      { name: "JBL Tune 510BT", description: "Bluetooth, batería larga" },
      { name: "Beats Studio3", description: "Sonido premium" },
      { name: "Sennheiser HD 599", description: "Audio de alta fidelidad" },
      { name: "Xiaomi Buds 4 Pro", description: "Cancelación activa" },
    ],
    equipos: [
      { name: "Minicomponente LG", description: "1000W de potencia" },
      { name: "Torre Samsung", description: "Con Bluetooth" },
      { name: "Sony MHC-V83D", description: "Luces y karaoke" },
      { name: "Philips Mini", description: "Compacto y potente" },
      { name: "JVC BoomBox", description: "Estilo retro" },
      { name: "Pioneer DJ System", description: "Ideal para fiestas" },
    ],
    parlantes: [
      { name: "JBL Flip 6", description: "Portátil, resistente al agua" },
      { name: "Bose SoundLink", description: "Sonido premium" },
      { name: "Sony SRS-XB33", description: "Extra Bass" },
      { name: "Anker Soundcore", description: "Económico y compacto" },
      { name: "Marshall Emberton", description: "Diseño clásico" },
      { name: "Harman Kardon Onyx", description: "Sonido envolvente" },
    ],
  },

  videojuegos: {
    consolas: [
      { name: "PlayStation 5", description: "Con lector de discos" },
      { name: "Xbox Series X", description: "1TB SSD" },
      { name: "Nintendo Switch", description: "Híbrida portátil" },
      { name: "Steam Deck", description: "PC portátil de Valve" },
      { name: "PlayStation 4 Slim", description: "1TB, aún vigente" },
      { name: "Xbox Series S", description: "Digital, compacta" },
    ],
    accesorios: [
      { name: "Control PS5 DualSense", description: "Retroalimentación háptica" },
      { name: "Xbox Controller", description: "Compatible con PC" },
      { name: "Volante Logitech G29", description: "Para simuladores" },
      { name: "Auriculares Turtle Beach", description: "Gaming headset" },
      { name: "Cámara PS5", description: "Streaming y VR" },
      { name: "Dock Nintendo Switch", description: "Para conectar a TV" },
    ],
    juegos: [
      { name: "FIFA 24", description: "Fútbol realista" },
      { name: "Call of Duty: MW2", description: "Shooter de acción" },
      { name: "Zelda: Breath of the Wild", description: "Mundo abierto" },
      { name: "Elden Ring", description: "RPG desafiante" },
      { name: "GTA V", description: "Mundo abierto clásico" },
      { name: "Spider-Man 2", description: "Exclusivo de PlayStation" },
    ],
  },
};

export default productsData;