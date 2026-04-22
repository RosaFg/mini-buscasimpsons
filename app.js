const boton        = document.getElementById('cargarDatos');
const resultado    = document.getElementById('resultado');
const searchInput  = document.getElementById('searchInput');
const loader       = document.getElementById('loader');
const loadMoreWrap = document.getElementById('loadMoreWrap');
const loadMoreBtn  = document.getElementById('loadMoreBtn');

const PAGE_SIZE = 8;
let allData      = [];
let shown        = 0;
let grid         = null;
let currentCount = null;

function renderCards(items) {
    items.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${(i % PAGE_SIZE) * 45}ms`;

        const imgBox = document.createElement('div');
        imgBox.className = 'card-img-box';

        const img = document.createElement('img');
        img.className = 'card-img';
        img.src = `https://api.buscasimpsons.com/images/${item.Episode.slice(0, 5)}/frame_${item.Frame}.jpg/medium/`;
        img.alt = item.Episode;
        img.loading = 'lazy';

        imgBox.appendChild(img);

        const info = document.createElement('div');
        info.className = 'card-info';

        const ep = document.createElement('div');
        ep.className = 'card-ep';
        ep.textContent = item.Episode;

        const quote = document.createElement('p');
        quote.className = 'card-quote';
        quote.textContent = item.Quote;

        const minute = document.createElement('p');
        minute.className = 'card-minute';
        minute.textContent = item.Minute;

        info.appendChild(ep);
        info.appendChild(quote);
        info.appendChild(minute);
        card.appendChild(imgBox);
        card.appendChild(info);
        grid.appendChild(card);
    });
}

function updateCounter() {
    if (currentCount) {
        currentCount.innerHTML = `Mostrando <span>${shown}</span> de <span>${allData.length}</span>`;
    }
    if (shown >= allData.length) {
        loadMoreWrap.classList.remove('visible');
    } else {
        loadMoreWrap.classList.add('visible');
    }
}

function doSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;

    allData      = [];
    shown        = 0;
    grid         = null;
    currentCount = null;

    resultado.innerHTML = '';
    loadMoreWrap.classList.remove('visible');
    loader.classList.add('active');
    boton.classList.add('loading');

    const url = `https://api.buscasimpsons.com/search/${encodeURIComponent(searchTerm)}`;

    fetch(url)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
            loader.classList.remove('active');
            boton.classList.remove('loading');

            if (!data || data.length === 0) {
                resultado.innerHTML = `
                    <div class="state">
                        <div class="state-title">Sin resultados</div>
                        <div class="state-body">No se encontro nada para "${searchTerm}"</div>
                    </div>`;
                return;
            }

            allData = data;

            const hdr = document.createElement('div');
            hdr.className = 'results-header';
            currentCount = document.createElement('div');
            currentCount.className = 'results-count';
            hdr.appendChild(currentCount);
            resultado.appendChild(hdr);

            grid = document.createElement('div');
            grid.className = 'grid';
            resultado.appendChild(grid);

            const first = allData.slice(0, PAGE_SIZE);
            shown = first.length;
            renderCards(first);
            updateCounter();
        })
        .catch(() => {
            loader.classList.remove('active');
            boton.classList.remove('loading');
            resultado.innerHTML = `
                <div class="state error">
                    <div class="state-title">Error de conexion</div>
                    <div class="state-body">No se pudo cargar la respuesta. Intentalo de nuevo.</div>
                </div>`;
        });
}

loadMoreBtn.addEventListener('click', () => {
    const next = allData.slice(shown, shown + PAGE_SIZE);
    shown += next.length;
    renderCards(next);
    updateCounter();
});

boton.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
