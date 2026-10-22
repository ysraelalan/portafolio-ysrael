document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".alternar-menu");
  const nav = document.querySelector(".navegacion-principal");

  // Navegación móvil con estado accesible.
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("abierto");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Cerrar navegación" : "Abrir navegación");
    });
    const closeMenu = () => {
      nav.classList.remove("abierto");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir navegación");
    };
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", event => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  // Filtrado por categoría: una tarjeta puede pertenecer a varias categorías.
  const filterButtons = document.querySelectorAll(".boton-filtro");
  const cards = document.querySelectorAll(".tarjeta-proyecto, .tarjeta-especialidad");
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("activo", active);
        item.setAttribute("aria-pressed", String(active));
      });
      cards.forEach(card => {
        const categories = (card.dataset.category || card.dataset.specialty || "").split(/\s+/);
        card.hidden = filter !== "todos" && !categories.includes(filter);
      });
    });
  });


  // Ruta de navegación: muestra la sección visible.
  const breadcrumbCurrent = document.querySelector(".migas-pan-current");
  const sections = [
    { id: "inicio", label: "Inicio" },
    { id: "trabajo", label: "Trabajo" },
    { id: "perfil", label: "Perfil" },
    { id: "trayectoria", label: "Trayectoria" },
    { id: "contacto", label: "Contacto" }
  ];
  if (breadcrumbCurrent && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const section = sections.find(item => item.id === visible.target.id);
      if (section) breadcrumbCurrent.textContent = section.label;
    }, { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.25] });
    sections.forEach(item => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });
  }


  // Visor editorial de la galería experimental: ampliación, miniaturas y navegación con teclado.
  const artTiles = Array.from(document.querySelectorAll("[data-art-index]"));
  const artModal = document.querySelector("#art-lightbox");
  if (artModal && artTiles.length) {
    const artItems = artTiles.map((tile) => ({
      title: tile.querySelector(".titulo-arte").textContent,
      description: tile.querySelector("img").alt + ". Pieza de referencia pendiente de sustituir por obra original.",
      image: tile.querySelector("img").src,
      alt: tile.querySelector("img").alt
    }));
    const artImage = artModal.querySelector("#art-lightbox-image");
    const artTitle = artModal.querySelector("#art-lightbox-title");
    const artDescription = artModal.querySelector("#art-lightbox-description");
    const artCounter = artModal.querySelector("#art-lightbox-counter");
    const artThumbs = artModal.querySelector("#art-lightbox-thumbs");
    let artIndex = 0;
    let artPreviousFocus = null;
    function renderArt() {
      const item = artItems[artIndex];
      artImage.src = item.image;
      artImage.alt = item.alt;
      artTitle.textContent = item.title;
      artDescription.textContent = item.description;
      artCounter.textContent = String(artIndex + 1).padStart(2, "0") + " / " + String(artItems.length).padStart(2, "0");
      artThumbs.innerHTML = "";
      artItems.forEach((thumb, i) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "art-thumb";
        b.setAttribute("aria-label", "Mostrar " + thumb.title);
        b.setAttribute("aria-current", String(i === artIndex));
        const im = document.createElement("img"); im.src = thumb.image; im.alt = ""; im.loading = "lazy";
        b.appendChild(im);
        b.addEventListener("click", () => { artIndex = i; renderArt(); });
        artThumbs.appendChild(b);
      });
    }
    function openArt(i, trigger) {
      artIndex = i; artPreviousFocus = trigger || document.activeElement; renderArt();
      artModal.hidden = false; artModal.setAttribute("aria-hidden","false");
      document.body.classList.add("visor-arte-abierto");
      artModal.querySelector(".cerrar-visor-arte").focus();
    }
    function closeArt() {
      artModal.hidden = true; artModal.setAttribute("aria-hidden","true");
      document.body.classList.remove("visor-arte-abierto");
      if (artPreviousFocus) artPreviousFocus.focus();
    }
    artTiles.forEach((tile,i) => tile.addEventListener("click",()=>openArt(i,tile)));
    artModal.querySelectorAll("[data-art-close]").forEach(b=>b.addEventListener("click",closeArt));
    artModal.querySelector(".arte-anterior").addEventListener("click",()=>{artIndex=(artIndex+artItems.length-1)%artItems.length;renderArt();});
    artModal.querySelector(".arte-siguiente").addEventListener("click",()=>{artIndex=(artIndex+1)%artItems.length;renderArt();});
    document.addEventListener("keydown",event=>{
      if(artModal.hidden) return;
      if(event.key==="Escape") closeArt();
      if(event.key==="ArrowLeft") artModal.querySelector(".arte-anterior").click();
      if(event.key==="ArrowRight") artModal.querySelector(".arte-siguiente").click();
    });
  }


  // Ventanas editoriales con una galería de seis imágenes por proyecto.
  const reviewModal = document.querySelector("#project-review-modal");
  if (reviewModal) {
    const galleryData = [
      [
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1455390582262-044c592e2c03?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1500&q=85"
      ],
      [
        "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1500&q=85"
      ],
      [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=85"
      ],
      [
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1500&q=85"
      ],
      [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1455390582262-044c592e2c03?auto=format&fit=crop&w=1500&q=85",
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1500&q=85"
      ]
    ];
    const reviewData = [
      {title:"Memoria impresa", subtitle:"Publicaciones sobre el patrimonio de La Paz", year:"Diseño editorial · 2010–2019", body:"Una serie de trece publicaciones que reúne historias urbanas, gastronomía, transporte y barrios paceños. El trabajo articula investigación visual, fotografía y diseño editorial para convertir información patrimonial en una experiencia de lectura clara, consistente y cercana. La retícula, la jerarquía tipográfica y el ritmo de las imágenes acompañan el contenido sin competir con él."},
      {title:"Arqueología en el espacio", subtitle:"Museo arqueológico a cielo abierto · Plaza Tejada Sorzano", year:"Museografía y comunicación · 2020–2021", body:"Una propuesta de interpretación del patrimonio que conecta el lugar con sus visitantes mediante infografías, señalética, publicación digital, códigos QR y recorrido virtual. El sistema busca ordenar la información por capas, facilitar la orientación y construir una lectura del sitio que combine contexto histórico, observación y experiencia espacial."},
      {title:"Una noche en el cementerio", subtitle:"Identidad visual, señalización y producción audiovisual", year:"Comunicación cultural · 2010–2020", body:"El proyecto reúne los recursos gráficos y audiovisuales de una experiencia cultural nocturna: línea visual, señalización del recorrido, planificación de cobertura fotográfica y producción audiovisual. La comunicación debía orientar al público y, al mismo tiempo, mantener una atmósfera respetuosa con el espacio, su memoria y los relatos que lo habitan."},
      {title:"Ciudad y comunicación", subtitle:"Manual de aplicación para Publicidad Urbana · La Paz", year:"Sistema visual · 2017", body:"Un sistema de criterios para aplicar el reglamento de publicidad urbana mediante cartillas y recursos de consulta. El diseño transforma disposiciones técnicas en información visual ordenada, con jerarquías, ejemplos y pautas que ayudan a interpretar las normas y favorecen una aplicación más coherente en el entorno urbano."},
      {title:"Fundamentos de diseño", subtitle:"Publicación académica para la carrera de Diseño Gráfico · ATENEA", year:"Edición y docencia · 2024", body:"Una publicación académica concebida para acompañar la formación en diseño gráfico. La compilación y redacción de contenidos se organiza con criterios editoriales que favorecen la comprensión progresiva de conceptos, la consulta y el aprendizaje autónomo. El proyecto combina estructura, diagramación y lenguaje didáctico para acercar los fundamentos del diseño a la práctica."}
    ];
    const panel = reviewModal.querySelector(".panel-resena-proyecto");
    const title = reviewModal.querySelector("#review-title");
    const subtitle = reviewModal.querySelector("#review-subtitle");
    const body = reviewModal.querySelector("#review-body");
    const year = reviewModal.querySelector("#review-year");
    const kicker = reviewModal.querySelector("#review-kicker");
    const photo = reviewModal.querySelector(".foto-resena-proyecto");
    const count = reviewModal.querySelector(".contador-galeria-resena");
    const dots = reviewModal.querySelector(".indicadores-galeria-resena");
    const prev = reviewModal.querySelector(".anterior-galeria-resena");
    const next = reviewModal.querySelector(".siguiente-galeria-resena");
    let previousFocus = null, activeProject = 0, activeImage = 0;
    function renderGallery() {
      const images = galleryData[activeProject];
      photo.style.backgroundImage = 'linear-gradient(rgba(20,22,18,.06),rgba(20,22,18,.06)),url("' + images[activeImage] + '")';
      photo.setAttribute("aria-label", "Imagen " + (activeImage + 1) + " de " + images.length + " del proyecto " + reviewData[activeProject].title);
      count.textContent = String(activeImage + 1).padStart(2,"0") + " / " + String(images.length).padStart(2,"0");
      dots.innerHTML = "";
      images.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button"; dot.className = "review-gallery-dot" + (i === activeImage ? " is-active" : "");
        dot.setAttribute("aria-label", "Mostrar imagen " + (i + 1));
        dot.setAttribute("aria-current", i === activeImage ? "true" : "false");
        dot.addEventListener("click", () => { activeImage = i; renderGallery(); });
        dots.appendChild(dot);
      });
    }
    function stepImage(delta) { activeImage = (activeImage + delta + galleryData[activeProject].length) % galleryData[activeProject].length; renderGallery(); }
    function openReview(index, trigger) {
      const item = reviewData[index]; if (!item) return;
      activeProject = index; activeImage = 0; previousFocus = trigger || document.activeElement;
      title.textContent = item.title; subtitle.textContent = item.subtitle; body.textContent = item.body; year.textContent = item.year;
      kicker.textContent = "RESEÑA DE PROYECTO · " + String(index + 1).padStart(2,"0");
      renderGallery();
      reviewModal.hidden = false; reviewModal.setAttribute("aria-hidden","false"); document.body.classList.add("project-review-open");
      reviewModal.querySelector(".cerrar-resena-proyecto").focus();
    }
    function closeReview() {
      reviewModal.hidden = true; reviewModal.setAttribute("aria-hidden","true"); document.body.classList.remove("project-review-open");
      if (previousFocus) previousFocus.focus();
    }
    document.querySelectorAll("[data-project-modal]").forEach(link => link.addEventListener("click", event => { event.preventDefault(); openReview(Number(link.dataset.projectModal), link); }));
    reviewModal.querySelectorAll("[data-review-close]").forEach(button => button.addEventListener("click", closeReview));
    prev.addEventListener("click", () => stepImage(-1)); next.addEventListener("click", () => stepImage(1));
    document.addEventListener("keydown", event => {
      if (reviewModal.hidden) return;
      if (event.key === "Escape") closeReview();
      if (event.key === "ArrowLeft") stepImage(-1);
      if (event.key === "ArrowRight") stepImage(1);
    });
    panel.addEventListener("keydown", event => { if (event.key !== "Tab") return; const focusable = [...panel.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]; if (!focusable.length) return; const first = focusable[0], last = focusable[focusable.length-1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } });
  }

  // Año de derechos de autor actualizado automáticamente.
  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();
});
