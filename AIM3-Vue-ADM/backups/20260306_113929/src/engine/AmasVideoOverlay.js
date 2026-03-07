/**
 * AMAS Video A2UI Renderer
 * 動画内の商品座標 [x, y, w, h] を受け取り、A2UIボタンをオーバーレイする
 * Converted to a Vue Composable for easier integration
 */

export class AmasVideoOverlay {
    constructor(videoElement, overlayContainer, onPurchaseCallback) {
        this.video = videoElement;
        this.container = overlayContainer;
        this.onPurchaseCallback = onPurchaseCallback;
    }

    // AI解析結果 (JSON) を受け取って描画
    renderA2UI(detectionResult) {
        this.container.innerHTML = ""; // 前のボタンをクリア

        if (!detectionResult || !detectionResult.products) return;

        detectionResult.products.forEach(product => {
            const { x, y, label, price } = product;

            // x, y are percentages (0-100) or 0-1. Assuming 0-1 for this logic based on previous examples,
            // BUT user snippet says "video.getBoundingClientRect... y * rect.height".
            // Let's assume input is normalized 0-1.

            // NOTE: We don't necessarily need absolute pixel positioning in the JS if using relative CSS in the container.
            // However, to follow the requested logic exactly:

            // Create button
            const button = document.createElement("button");
            button.className = "amas-a2ui-btn glow-animation absolute flex flex-col items-center group";

            // Use % positioning for responsiveness without re-calc on resize
            button.style.left = `${x * 100}%`;
            button.style.top = `${y * 100}%`;
            button.style.transform = 'translate(-50%, -50%)'; // Center on coordinate
            button.style.zIndex = '1000';
            button.style.pointerEvents = 'auto'; // Ensure clickable

            button.innerHTML = `
          <div class="relative">
             <div class="w-8 h-8 rounded-full border-2 border-sky-400 bg-black/20 backdrop-blur animate-ping absolute inset-0"></div>
             <div class="w-8 h-8 rounded-full border border-sky-400 bg-sky-500/20 backdrop-blur flex items-center justify-center text-lg shadow-[0_0_15px_rgba(56,189,248,0.6)]">
                🧚
             </div>
             
             <!-- Popup on Hover -->
             <div class="absolute left-10 top-0 bg-slate-900/90 border border-sky-500/50 rounded-lg p-3 min-w-[140px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                <span class="text-[10px] text-sky-400 font-bold uppercase tracking-wider block mb-1">${label}</span>
                <div class="text-white font-mono text-sm mb-2">¥${price.toLocaleString()}</div>
                <div class="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] py-1 px-2 rounded text-center shadow-lg font-bold">
                    Atomic Mint
                </div>
             </div>
          </div>
      `;

            button.onclick = (e) => {
                e.stopPropagation(); // Prevent toggling video controls if any
                this.executeAgenticPurchase(product);
            };

            this.container.appendChild(button);
        });
    }

    executeAgenticPurchase(product) {
        if (this.onPurchaseCallback) {
            this.onPurchaseCallback(product);
        }
    }
}
