let currentPage;
let totalPages;
let startPage;
let startTime;
let currentBackgroundColor = '#ffffff';

function exportToPDF() {
    const title = document.getElementById('title-input').value || 'صفحات القرآن الكريم';
    const imagesToConvert = [];

    for (let i = startPage; i <= Math.min(startPage + totalPages - 1, 604); i++) {
        imagesToConvert.push(fetchAndConvertImageToBase64(`https://read-quran.github.io/quran/Quran/${i}.jpg`));
    }

    Promise.all(imagesToConvert)
        .then(base64Images => {
            const pdf = new jspdf.jsPDF();
            
            base64Images.forEach((base64Image, index) => {
                if (index > 0) {
                    pdf.addPage();
                }
                
                const imgProps = pdf.getImageProperties(base64Image);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pdfWidth - 20; // هامش 10 بكسل على كل جانب
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                
                const scale = Math.min(1, Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight));
                
                const finalImgWidth = imgWidth * scale;
                const finalImgHeight = imgHeight * scale;
                
                const x = (pdfWidth - finalImgWidth) / 2;
                const y = (pdfHeight - finalImgHeight) / 2;
                
                pdf.addImage(base64Image, 'jpg', x, y, finalImgWidth, finalImgHeight);
                
                pdf.setFontSize(10);
                pdf.text(`${startPage + index}`, pdfWidth / 2, pdfHeight - 10, { align: "center" });
            });
            
            // حفظ ملف PDF
            pdf.save(`${title}.pdf`);
        })
        .catch(error => console.error('Error converting images:', error));
}

function initializePages() {
    totalPages = parseInt(document.getElementById('page-count').value);
    startPage = parseInt(document.getElementById('start-page').value);
    currentPage = startPage;
    startTime = new Date();
    showCurrentPage();
    updatePagination();
}

function showCurrentPage() {
    const container = document.getElementById('quran-page-container');
    container.innerHTML = '';

    if (!totalPages || !startPage || isNaN(currentPage)) {
        return;
    }

    if (currentPage > startPage + totalPages - 1 || currentPage > 604) {
        container.innerHTML = '<p class="finished-text">تم الانتهاء من جميع الصفحات</p>';

        const backButton = document.createElement('button');
        backButton.className = 'read-button';
        backButton.textContent = 'العودة لأول صفحة';
        backButton.onclick = resetToFirstPage;

        const shareButton = document.createElement('button');
        shareButton.className = 'share-button';
        shareButton.textContent = 'مشاركة عبر الواتساب';
        shareButton.onclick = shareOnWhatsApp;

        container.appendChild(backButton);
        container.appendChild(shareButton);
        return;
    }

    const pageDiv = document.createElement('div');
    pageDiv.className = 'quran-page';

    const img = document.createElement('img');
    img.src = `https://read-quran.github.io/quran/Quran/${currentPage}.jpg`;
    img.alt = `صفحة ${currentPage}`;

    const button = document.createElement('button');
    button.className = 'read-button';
    button.textContent = 'تمت القراءة';
    button.onclick = nextPage;

    img.onerror = () => {
        img.alt = `تعذر تحميل صفحة ${currentPage}`;
    };

    pageDiv.appendChild(img);
    pageDiv.appendChild(button);
    container.appendChild(pageDiv);

    updatePagination();
}

function resetToFirstPage() {
    currentPage = startPage;
    showCurrentPage();
}

function nextPage() {
    currentPage++;
    showCurrentPage();
}

function goToPage(page) {
    currentPage = page;
    showCurrentPage();
}

function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPageCount = Math.min(startPage + totalPages - 1, 604);
    
    for (let i = startPage; i <= totalPageCount; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = 'page-button';
        if (i === currentPage) {
            pageButton.classList.add('current-page');
        }
        if (i < currentPage) {
            pageButton.classList.add('read-page');
        }
        pageButton.onclick = () => goToPage(i);
        paginationContainer.appendChild(pageButton);
    }
}



function fetchAndConvertImageToBase64(imgUrl) {
    return fetch(imgUrl)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));
}

function exportPage() {
    const title = document.getElementById('title-input').value || 'عرض صفحات القرآن';
    const imagesToConvert = [];

    for (let i = startPage; i <= Math.min(startPage + totalPages - 1, 604); i++) {
        imagesToConvert.push(fetchAndConvertImageToBase64(`https://read-quran.github.io/quran/Quran/${i}.jpg`));
    }

    Promise.all(imagesToConvert)
        .then(base64Images => {
            let imagesHtml = '';
            base64Images.forEach((base64Image, index) => {
                imagesHtml += `<div class="quran-page">
                    <img src="${base64Image}" alt="صفحة ${startPage + index}">
                </div>`;
            });

            const exportContent = `
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; direction: rtl; text-align: center; background-color: ${currentBackgroundColor}; color: ${currentBackgroundColor === '#ffffff' ? '#000000' : '#ffffff'}; transition: background-color 0.3s, color 0.3s; }
                        h1 { font-size: 2em; margin: 20px 0; color: ${currentBackgroundColor === '#ffffff' ? '#006400' : '#28a745'}; border: 2px solid ${currentBackgroundColor === '#ffffff' ? '#006400' : '#28a745'}; padding: 10px; border-radius: 8px; display: inline-block; }
                        .quran-page { margin-bottom: 20px; }
                        .quran-page img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; padding: 5px; background-color: white; }
                        .read-button { margin-top: 10px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; padding: 10px 20px; font-size: 1em; display: inline-block; }
                        .read-button:hover { background-color: #218838; }
                        p.finished-text { color: #28a745; font-size: 1.2em; font-weight: bold; }
                        #pagination { margin-top: 20px; display: flex; justify-content: center; flex-wrap: wrap; }
                        .page-button { margin: 5px; padding: 5px 10px; cursor: pointer; border: 1px solid #ddd; background-color: #f8f9fa; border-radius: 5px; }
                        .page-button.current-page { background-color: #28a745; color: white; }
                        .page-button.read-page { background-color: #007bff; color: white; }
                        #color-buttons { position: fixed; left: 20px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 10px; }
                        .color-option { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; transition: transform 0.3s; }
                        .color-option:hover { transform: scale(1.1); }
                        @media (max-width: 768px) {
                            h1 { font-size: 1.5em; }
                            .quran-page img { max-width: 95%; }
                            #color-buttons { left: 10px; }
                            .color-option { width: 20px; height: 20px; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <div id="color-buttons">
                        <button class="color-option" data-color="#343a40" style="background-color: #343a40;"></button>
                        <button class="color-option" data-color="#ffffff" style="background-color: #ffffff;"></button>
                    </div>
                    <main id="quran-page-container">
                        ${imagesHtml}
                    </main>
                    <div id="pagination"></div>
                    <script>
                        document.querySelectorAll('.color-option').forEach(button => {
                            button.addEventListener('click', () => {
                                document.body.style.backgroundColor = button.dataset.color;
                                document.body.style.color = button.dataset.color === '#ffffff' ? '#000000' : '#ffffff';
                                document.querySelector('h1').style.color = button.dataset.color === '#ffffff' ? '#006400' : '#28a745';
                                document.querySelector('h1').style.borderColor = button.dataset.color === '#ffffff' ? '#006400' : '#28a745';
                            });
                        });
                    </script>
                </body>
                </html>
            `;

            const blob = new Blob([exportContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.html`;
            a.click();
            URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error converting images:', error));
}

document.querySelectorAll('.color-option').forEach(button => {
    button.addEventListener('click', () => {
        currentBackgroundColor = button.dataset.color;
        document.body.style.backgroundColor = currentBackgroundColor;
        document.body.style.color = currentBackgroundColor === '#ffffff' ? '#000000' : '#ffffff';
    });
});

document.getElementById('title-input').addEventListener('input', (e) => {
    document.getElementById('page-title').textContent = e.target.value || 'عرض صفحات القرآن';
});
