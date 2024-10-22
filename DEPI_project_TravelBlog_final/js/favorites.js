// فتح قاعدة البيانات في IndexedDB
let db;
const request = indexedDB.open("favoritesDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    displayFavorites(); // عرض المفضلة تلقائيًا عند فتح الصفحة
};

request.onerror = function() {
    console.error("Error opening the database.");
};

// وظيفة لعرض الصور المحفوظة في المفضلة
function displayFavorites() {
    const transaction = db.transaction(["images"], "readonly");
    const objectStore = transaction.objectStore("images");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const images = event.target.result;
        const favoritesList = document.getElementById("favoritesList");

        // مسح المحتوى السابق لتجنب التكرار
        favoritesList.innerHTML = '';

        if (images.length === 0) {
            favoritesList.innerHTML = "<p>No favorites found.</p>";
            return;
        }

        let rowDiv; // متغير لإنشاء صف جديد كل 4 صور

        images.forEach((image, index) => {
            // إنشاء صف جديد كل 4 صور
            if (index % 4 === 0) {
                rowDiv = document.createElement("div");
                rowDiv.className = "row"; // استخدام Bootstrap
                favoritesList.appendChild(rowDiv);
            }

            // إنشاء عمود يحتوي على الصورة
            const colDiv = document.createElement("div");
            colDiv.className = "col-md-3 p-2"; // تخصيص 4 أعمدة

            colDiv.innerHTML = `
                <div class="thumbnail" style="border:none;">
                    <img src="${image.imgUrl}" alt="${image.id}" class="img-fluid" style="width: 100%; height: auto; object-fit: cover;">
                    <div class="caption text-center">
                        <h5>${image.id}</h5>
                        <button class="btn btn-danger remove-btn" data-id="${image.id}">Remove from favorites</button>
                    </div>
                </div>
            `;

            rowDiv.appendChild(colDiv); // إضافة الصورة للصف الحالي
        });

        addRemoveEventListeners(); // إضافة مستمعات لأزرار الإزالة
    };

    request.onerror = function() {
        console.error("Error fetching favorites.");
    };
}

// إضافة مستمعين لأزرار "إزالة من المفضلة"
function addRemoveEventListeners() {
    const removeButtons = document.querySelectorAll(".remove-btn");
    removeButtons.forEach(button => {
        button.onclick = function() {
            const id = button.getAttribute("data-id");
            removeFavorite(id);
        };
    });
}

// إزالة الصورة من IndexedDB
function removeFavorite(id) {
    const transaction = db.transaction(["images"], "readwrite");
    const objectStore = transaction.objectStore("images");
    const request = objectStore.delete(id);

    request.onsuccess = function() {
        console.log(`Image with ID ${id} removed successfully.`);
        displayFavorites(); // تحديث قائمة المفضلة بعد الحذف
    };

    request.onerror = function() {
        console.error(`Error removing image with ID ${id}.`);
    };
}

// إضافة صورة جديدة إلى المفضلة
function addFavorite(imageUrl) {
    const id = Date.now().toString(); // توليد معرّف فريد بناءً على الوقت الحالي
    const transaction = db.transaction(["images"], "readwrite");
    const objectStore = transaction.objectStore("images");

    const newImage = {
        id: id,
        imgUrl: imageUrl
    };

    const request = objectStore.add(newImage);

    request.onsuccess = function() {
        console.log("Image added successfully.");
        addImageToDisplay(newImage); // إضافة الصورة مباشرة إلى العرض
    };

    request.onerror = function() {
        console.error("Error adding image:", request.error);
    };
}

// إضافة صورة إلى العرض مباشرة
function addImageToDisplay(image) {
    const favoritesList = document.getElementById("favoritesList");
    let rowDiv;

    if (favoritesList.children.length === 0 || favoritesList.lastChild.children.length >= 4) {
        rowDiv = document.createElement("div");
        rowDiv.className = "row";
        favoritesList.appendChild(rowDiv);
    } else {
        rowDiv = favoritesList.lastChild; // استخدام الصف الحالي
    }

    const colDiv = document.createElement("div");
    colDiv.className = "col-md-3 p-2";

    colDiv.innerHTML = `
        <div class="thumbnail">
            <img src="${image.imgUrl}" alt="${image.id}" class="img-responsive" style="width: 100%; height: auto;">
            <div class="caption text-center">
                <h5>${image.id}</h5>
                <button class="btn btn-danger remove-btn" data-id="${image.id}">Remove from favorites</button>
            </div>
        </div>
    `;

    rowDiv.appendChild(colDiv); // إضافة الصورة للصف الحالي
    addRemoveEventListeners(); // إضافة مستمعين لأزرار الإزالة
}
