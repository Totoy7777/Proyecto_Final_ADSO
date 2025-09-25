const productsData = {
  computadores: {
    portatiles: [
      { id:"1", name: "Laptop Lenovo", description: "Lenovo Ryzen 5, 16GB RAM, 512GB SSD", image: "/src/assets/imagenesproductos/computadores/pc/lenovo.jpg" },
      { id:"2", name: "Portatil HP", description: "AMD Ryzen 7- RAM 16GB", image: "/src/assets/imagenesproductos/computadores/pc/hp15.jpg" },
      { id:"3", name: "MacBook Air M1", description: "Chip M1, 8GB RAM, 256GB SSD", image: "/src/assets/imagenesproductos/computadores/pc/mcbook.jpg" },
      { id:"4", name: "HP Pavilion", description: "Ryzen 7, 16GB RAM, 512GB SSD", image: "/src/assets/imagenesproductos/computadores/pc/hp14.jpg" },
      { id:"5", name: "Acer Nitro 5", description: "Gaming, RTX 3050, 16GB RAM", image: "/src/assets/imagenesproductos/computadores/pc/acer15.jpg" },
      { id:"6", name: "Asus ZenBook", description: "Ultrabook, ligero y potente", image: "/src/assets/imagenesproductos/computadores/pc/asus.jpg" },
    ],
    escritorio: [
      { id:"30", name: "PC Gamer", description: "Intel i9, RTX 4060, 32GB RAM", image: "/src/assets/imagenesproductos/computadores/pcescritorio/asus27.jpg" },
      { id:"31", name: "PC Oficina", description: "Intel i3, 8GB RAM, SSD 256GB", image: "/src/assets/imagenesproductos/computadores/pcescritorio/acer.png" },
      { id:"32", name: "PC Diseño Gráfico", description: "Ryzen 7, Quadro P2200, 32GB RAM", image: "/src/assets/imagenesproductos/computadores/pcescritorio/imac.jpg" },
      { id:"33", name: "All-in-One HP", description: "24 pulgadas, Core i5", image: "/src/assets/imagenesproductos/computadores/pcescritorio/lenovo.jpg" },
      { id:"34", name: "PC Compacto Lenovo", description: "Pequeño y eficiente", image: "/src/assets/imagenesproductos/computadores/pcescritorio/yoga.jpg" },
      { id:"35", name: "Workstation Dell", description: "Xeon, 64GB RAM, para servidores", image: "/src/assets/imagenesproductos/computadores/pcescritorio/imac24.jpg" },
    ],
    accesorios: [
      { id:"61", name: "Teclado Mecánico RGB", description: "Switch Red, retroiluminado", image: "/src/assets/imagenesproductos/computadores/accesorios/tecladoRGB.jpg" },
      { id:"62", name: "Mouse Logitech G502", description: "Ergonómico y gamer", image: "/src/assets/imagenesproductos/computadores/accesorios/Mouseg502.jpg" },
      { id:"63", name: "Monitor Samsung Curvo 27\"", description: "Full HD, 144Hz", image: "/src/assets/imagenesproductos/computadores/accesorios/monitor27.jpg" },
      { id:"64", name: "Disco Duro Externo 2TB", description: "USB 3.0 portátil",image: "/src/assets/imagenesproductos/computadores/accesorios/discoduro.jpg" },
      { id:"65", name: "Base refrigerante", description: "Con ventiladores y luces LED", image: "/src/assets/imagenesproductos/computadores/accesorios/baserefrigerante.jpg" },
      { id:"66", name: "Memoria USB 128GB", description: "Ultra rápida 3.1", image: "/src/assets/imagenesproductos/computadores/accesorios/memoria.jpg" },
    ],
  },

  celulares: {
    smartphones: [
      { id:"81", name: "iPhone 16", description: "256GB, cámara Exclusiva", image: "/src/assets/imagenesproductos/celulares/celukos/iphone16.png" },
      { id:"82", name: "Samsung Galaxy S23", description: "Pantalla AMOLED 120Hz", image: "/src/assets/imagenesproductos/celulares/celukos/Samsung-Galaxy-S23.jpg" },
      { id:"83", name: "Xiaomi Redmi Note 12", description: "Batería 5000mAh", image: "/src/assets/imagenesproductos/celulares/celukos/redmi12.jpg" },
      { id:"84", name: "Motorola Edge 40", description: "Carga rápida 68W", image: "/src/assets/imagenesproductos/celulares/celukos/Motorola.jpg"},
      { id:"85", name: "Google Pixel 7", description: "Android puro, cámara avanzada", image: "/src/assets/imagenesproductos/celulares/celukos/pixel7.jpg" },
      { id:"86", name: "OnePlus 11", description: "Snapdragon 8 Gen 2, 16GB RAM", image: "/src/assets/imagenesproductos/celulares/celukos/oneplus.jpg" },
    ],
    basicos: [
      { id:"141", name: "Nokia 110", description: "Teléfono clásico, batería duradera", image: "/src/assets/imagenesproductos/celulares/basicos/nokia.jpg" },
      { id:"142", name: "Alcatel 1", description: "Pantalla pequeña, económico", image: "/src/assets/imagenesproductos/celulares/basicos/alcatel.jpg" },
      { id:"143", name: "Samsung Keystone", description: "Botones grandes, sencillo", image: "/src/assets/imagenesproductos/celulares/basicos/keystone.jpg" },
      { id:"144", name: "Nokia 3310", description: "Versión moderna del clásico", image: "/src/assets/imagenesproductos/celulares/basicos/nokia3.jpg" },
      { id:"145", name: "Bmobile AX107", description: "Básico con linterna", image: "/src/assets/imagenesproductos/celulares/basicos/mobile.jpg" },
      { id:"146", name: "Blu Z5", description: "Práctico y económico", image: "/src/assets/imagenesproductos/celulares/basicos/blu.jpg" },
    ],
    accesorios: [
      { id:"171", name: "Cargador Rápido 25W", description: "USB-C compatible", image: "/src/assets/imagenesproductos/celulares/accesorioscel/cargador.jpg" },
      { id:"172", name: "Forro Transparente", description: "Silicona flexible", image: "/src/assets/imagenesproductos/celulares/accesorioscel/forro.jpg" },
      { id:"173", name: "Vidrio Templado 9H", description: "Alta resistencia", image: "/src/assets/imagenesproductos/celulares/accesorioscel/vidrio.jpg" },
      { id:"174", name: "Cargador Inalámbrico", description: "Carga rápida Qi", image: "/src/assets/imagenesproductos/celulares/accesorioscel/cagadorinalambrico.jpg" },
      { id:"175", name: "Audífonos In-Ear", description: "Con micrófono", image: "/src/assets/imagenesproductos/celulares/accesorioscel/audifonos.jpg" },
      { id:"176", name: "Batería Portátil 20,000mAh", description: "Con carga rápida", image: "/src/assets/imagenesproductos/celulares/accesorioscel/bateria.jpg" },
    ],
  },

  tv: {
    led: [
      { id:"200", name: "Samsung LED 43\"", description: "Resolución Full HD", image: "/src/assets/imagenesproductos/tv/LED/led43.jpg" },
      { id:"201", name: "LG LED 55\"", description: "Con HDR", image: "/src/assets/imagenesproductos/tv/LED/led55.jpg" },
      { id:"202", name: "Hisense 40\"", description: "Económica, buen contraste", image: "/src/assets/imagenesproductos/tv/LED/hisense40.jpg" },
      { id:"203", name: "Sony Bravia 50\"", description: "Tecnología Triluminos", image: "/src/assets/imagenesproductos/tv/LED/sony50.jpg" },
      { id:"204", name: "TCL 65\"", description: "Pantalla grande y económica", image: "/src/assets/imagenesproductos/tv/LED/65.jpg" },
      { id:"205", name: "Philips 32\"", description: "Ideal para habitaciones pequeñas", image: "/src/assets/imagenesproductos/tv/LED/32.jpg" },
    ],
    proyectores: [
      { id:"250", name: "Proyector Epson", description: "Alta luminosidad", image: "/src/assets/imagenesproductos/tv/Proyectores/epson.jpg" },
      { id:"251", name: "Proyector BenQ", description: "Cine en casa", image: "/src/assets/imagenesproductos/tv/Proyectores/benq.jpg" },
      { id:"252", name: "Proyector LG", description: "Portátil con batería", image: "/src/assets/imagenesproductos/tv/Proyectores/LG.jpg" },
      { id:"253", name: "Proyector Xiaomi", description: "Resolución 4K", image: "/src/assets/imagenesproductos/tv/Proyectores/xiaomi.jpg" },
      { id:"254", name: "Proyector Optoma", description: "Ideal para oficinas", image: "/src/assets/imagenesproductos/tv/Proyectores/optoma.jpg" },
      { id:"255", name: "Proyector ViewSonic", description: "Compacto y versátil", image: "/src/assets/imagenesproductos/tv/Proyectores/view.jpg" },
    ],
    smart: [
      { id:"270", name: "LG Smart TV 50\"", description: "WebOS integrado", image: "/src/assets/imagenesproductos/tv/SmartTV/tv50.jpg" },
      { id:"271", name: "Sony Bravia 65\"", description: "Android TV", image: "/src/assets/imagenesproductos/tv/SmartTV/tv65.jpg" },
      { id:"272", name: "Samsung QLED 55\"", description: "Colores vivos", image: "/src/assets/imagenesproductos/tv/SmartTV/tv55.jpg" },
      { id:"273", name: "Philips Ambilight 58\"", description: "Iluminación envolvente", image: "/src/assets/imagenesproductos/tv/SmartTV/tv58.jpg" },
      { id:"274", name: "TCL Roku TV 40\"", description: "SmartTV con Roku", image: "/src/assets/imagenesproductos/tv/SmartTV/tv40.jpg" },
      { id:"275", name: "Hisense VIDAA 43\"", description: "Sistema operativo propio", image: "/src/assets/imagenesproductos/tv/SmartTV/tv43.jpg" },
    ],
  },

  audio: {
    audifonos: [
      { id:"300", name: "Sony WH-1000XM4", description: "Cancelación de ruido", image: "/src/assets/imagenesproductos/sonido/audifonos/sonywh.jpg" },
      { id:"301", name: "AirPods Pro", description: "Inalámbricos", image: "/src/assets/imagenesproductos/sonido/audifonos/airpods2.jpg" },
      { id:"302", name: "JBL Tune 510BT", description: "Bluetooth, batería larga", image: "/src/assets/imagenesproductos/sonido/audifonos/JBL.jpg" },
      { id:"303", name: "Beats Studio3", description: "Sonido premium", image: "/src/assets/imagenesproductos/sonido/audifonos/beats.jpg" },
      { id:"304", name: "Sennheiser HD 599", description: "Audio de alta fidelidad", image: "/src/assets/imagenesproductos/sonido/audifonos/sennheiser.jpg" },
      { id:"305", name: "Xiaomi Buds 4 Pro", description: "Cancelación activa", image: "/src/assets/imagenesproductos/sonido/audifonos/buds.jpg" },
    ],
    equipos: [
      { id:"360", name: "Minicomponente LG", description: "1000W de potencia", image: "/src/assets/imagenesproductos/sonido/equipos/minicomponente.jpg" },
      { id:"361", name: "Torre Samsung", description: "Con Bluetooth", image: "/src/assets/imagenesproductos/sonido/equipos/torre.jpg" },
      { id:"362", name: "Sony MHC-V83D", description: "Luces y karaoke", image: "/src/assets/imagenesproductos/sonido/equipos/MHC.jpg" },
      { id:"363", name: "Philips Mini", description: "Compacto y potente", image: "/src/assets/imagenesproductos/sonido/equipos/mini.jpg" },
      { id:"364", name: "JVC BoomBox", description: "Estilo retro", image: "/src/assets/imagenesproductos/sonido/equipos/JVC.jpg" },
      { id:"365", name: "Pioneer DJ System", description: "Ideal para fiestas", image: "/src/assets/imagenesproductos/sonido/equipos/pioneer.jpg" },
    ],
    parlantes: [
      { id:"391", name: "JBL Flip 6", description: "Portátil, resistente al agua", image: "/src/assets/imagenesproductos/sonido/parlantes/jbl6.jpg" },
      { id:"392", name: "Bose SoundLink", description: "Sonido premium", image: "/src/assets/imagenesproductos/sonido/parlantes/bose.jpg" },
      { id:"393", name: "Sony SRS-XB33", description: "Extra Bass", image: "/src/assets/imagenesproductos/sonido/parlantes/sony.jpg" },
      { id:"394", name: "Anker Soundcore", description: "Económico y compacto", image: "/src/assets/imagenesproductos/sonido/parlantes/anker.jpg" },
      { id:"395", name: "Marshall Emberton", description: "Diseño clásico", image: "/src/assets/imagenesproductos/sonido/parlantes/marshall.jpg" },
      { id:"396", name: "Harman Kardon Onyx", description: "Sonido envolvente", image: "/src/assets/imagenesproductos/sonido/parlantes/harman.jpg" },
    ],
  },

  videojuegos: {
    consolas: [
      { id:"421", name: "PlayStation 5", description: "Con lector de discos", image: "/src/assets/imagenesproductos/videojuegos/consolas/ps5.jpg"  },
      { id:"422", name: "Xbox Series X", description: "1TB SSD", image: "/src/assets/imagenesproductos/videojuegos/consolas/seriesx.jpg"  },
      { id:"423", name: "Nintendo Switch", description: "Híbrida portátil", image: "/src/assets/imagenesproductos/videojuegos/consolas/nintendo.jpg"  },
      { id:"424", name: "Steam Deck", description: "PC portátil de Valve", image: "/src/assets/imagenesproductos/videojuegos/consolas/steam.jpg"  },
      { id:"425", name: "PlayStation 4 Slim", description: "1TB, aún vigente", image: "/src/assets/imagenesproductos/videojuegos/consolas/ps4.jpg"  },
      { id:"426", name: "Xbox Series S", description: "Digital, compacta", image: "/src/assets/imagenesproductos/videojuegos/consolas/series5.jpg"  },
    ],
    accesorios: [
      { id:"435", name: "Control PS5 DualSense", description: "Retroalimentación háptica", image: "/src/assets/imagenesproductos/videojuegos/Accesoriosvideo/controlps5.jpg"  },
      { id:"436", name: "Xbox Controller", description: "Compatible con PC", image: "/src/assets/imagenesproductos/videojuegos/Accesoriosvideo/controlxbox.jpg"  },
      { id:"437", name: "Volante Logitech G29", description: "Para simuladores", image: "/src/assets/imagenesproductos/videojuegos/Accesoriosvideo/volante.jpg"  },
      { id:"438", name: "Auriculares Turtle Beach", description: "Gaming headset", image: "/src/assets/imagenesproductos/videojuegos/Accesoriosvideo/audiculares.jpg"  },
      { id:"439", name: "Cámara PS5", description: "Streaming y VR", image: "/src/assets/imagenesproductos/videojuegos/Accesoriosvideo/camara.jpg"  },
      { id:"440", name: "Dock Nintendo Switch", description: "Para conectar a TV", image: "/src/assets/imagenesproductos/videojuegos/Accesoriosvideo/dock.jpg"  },
    ],
    juegos: [
      { id:"490", name: "FIFA 24", description: "Fútbol realista", image: "/src/assets/imagenesproductos/videojuegos/juegos/fifa24.jpg"  },
      { id:"491", name: "Call of Duty: MW2", description: "Shooter de acción", image: "/src/assets/imagenesproductos/videojuegos/juegos/cold.jpg" },
      { id:"492", name: "Zelda: Breath of the Wild", description: "Mundo abierto", image: "/src/assets/imagenesproductos/videojuegos/juegos/zelda.jpg" },
      { id:"493", name: "Elden Ring", description: "RPG desafiante", image: "/src/assets/imagenesproductos/videojuegos/juegos/eldenring.jpg" },
      { id:"494", name: "GTA V", description: "Mundo abierto clásico", image: "/src/assets/imagenesproductos/videojuegos/juegos/gta.jpg" },
      { id:"495", name: "Spider-Man 2", description: "Exclusivo de PlayStation", image: "/src/assets/imagenesproductos/videojuegos/juegos/spiderman.jpg" },
    ],
  },
};

export default productsData;