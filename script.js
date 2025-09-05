document.addEventListener('DOMContentLoaded', () => {
    // --- Custom Cursor Implementation ---
    const cursor = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-dot-outline');

    const updateCursor = (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
        
        cursorOutline.style.left = `${x}px`;
        cursorOutline.style.top = `${y}px`;
    };

    const updateCursorVisibility = (visible) => {
        cursor.style.opacity = visible ? "1" : "0";
        cursorOutline.style.opacity = visible ? "1" : "0";
    };

    // Handle cursor movement
    window.addEventListener('mousemove', updateCursor);
    
    // Handle cursor leaving/entering the window
    document.addEventListener('mouseenter', () => updateCursorVisibility(true));
    document.addEventListener('mouseleave', () => updateCursorVisibility(false));

    // Add hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('button, input, a');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorOutline.style.background = 'rgba(67, 97, 238, 0.4)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.background = 'rgba(67, 97, 238, 0.3)';
        });
    });

    // --- Fungsionalitas Tab Menu ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            const targetTab = button.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
            button.classList.add('active');
        });
    });

    // --- Fungsionalitas Kompres Foto ---
    const fileInput = document.getElementById('fileInput');
    const compressBtn = document.getElementById('compressBtn');
    const statusDiv = document.getElementById('status');

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            compressBtn.disabled = false;
            statusDiv.textContent = `${fileInput.files.length} foto terpilih.`;
            statusDiv.classList.remove('success', 'error');
        } else {
            compressBtn.disabled = true;
            statusDiv.textContent = '';
        }
    });

    compressBtn.addEventListener('click', async () => {
        const files = fileInput.files;
        if (files.length === 0) {
            statusDiv.textContent = 'Pilih setidaknya satu foto.';
            return;
        }

        statusDiv.textContent = 'Memulai kompresi dan pembuatan ZIP... Mohon tunggu.';
        compressBtn.disabled = true;
        statusDiv.classList.remove('success', 'error');

        const zip = new JSZip();
        let compressedCount = 0;
        const totalFiles = files.length;

        for (const file of files) {
            try {
                const convertedBlob = await convertImageToWebP(file);
                const newFileName = file.name.replace(/\.(png|jpg|jpeg)$/i, '.webp');
                zip.file(newFileName, convertedBlob);

                compressedCount++;
                statusDiv.textContent = `Mengkompres: ${compressedCount}/${totalFiles}`;
            } catch (error) {
                console.error(`Gagal mengkompresi ${file.name}:`, error);
                statusDiv.textContent = `Error: Gagal memproses ${file.name}.`;
                statusDiv.classList.add('error');
            }
        }

        if (compressedCount > 0) {
            zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    saveAs(content, "foto-terkompresi.zip");
                    statusDiv.textContent = `Selesai! ${compressedCount} foto berhasil dikompres dan diunduh.`;
                    statusDiv.classList.add('success');
                })
                .catch(error => {
                    statusDiv.textContent = `Terjadi kesalahan saat membuat file ZIP.`;
                    statusDiv.classList.add('error');
                    console.error('Error generating ZIP:', error);
                });
        } else {
            statusDiv.textContent = `Tidak ada foto yang berhasil dikompres.`;
            statusDiv.classList.add('error');
        }

        compressBtn.disabled = false;
    });

    function convertImageToWebP(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Gagal mengkonversi gambar ke Blob."));
                        }
                    }, 'image/webp', 0.8); // Kualitas 80%
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
        });
    }

    // --- Fungsionalitas Jernihkan Foto ---
    const upscaleFileInput = document.getElementById('upscaleFileInput');
    const upscaleBtn = document.getElementById('upscaleBtn');
    const upscaleStatus = document.getElementById('upscaleStatus');

    upscaleFileInput.addEventListener('change', () => {
        if (upscaleFileInput.files.length > 0) {
            upscaleBtn.disabled = false;
            upscaleStatus.textContent = `${upscaleFileInput.files.length} foto terpilih.`;
            upscaleStatus.classList.remove('success', 'error');
        } else {
            upscaleBtn.disabled = true;
            upscaleStatus.textContent = '';
        }
    });

    upscaleBtn.addEventListener('click', async () => {
        const file = upscaleFileInput.files[0];
        if (!file) {
            upscaleStatus.textContent = 'Pilih satu foto untuk dijernihkan.';
            return;
        }
        
        upscaleStatus.textContent = 'Fitur ini masih dalam pengembangan. Mohon tunggu update selanjutnya!';
        upscaleStatus.classList.add('error');
        upscaleBtn.disabled = true;

        // Di sini seharusnya ada logika untuk memproses gambar dengan AI
        // Namun, karena rumit, ini hanya contoh:
        // const upscaledImage = await processWithAI(file);
        // saveAs(upscaledImage, `jernih-${file.name}`);

        // setTimeout untuk mensimulasikan proses
        setTimeout(() => {
            upscaleStatus.textContent = 'Maaf, fitur ini belum bisa digunakan.';
            upscaleStatus.classList.add('error');
            upscaleBtn.disabled = false;
        }, 3000);
    });
});