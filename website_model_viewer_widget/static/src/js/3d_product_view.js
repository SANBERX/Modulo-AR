/** @odoo-module */

import publicWidget from '@web/legacy/js/public/public_widget';
import { jsonrpc } from "@web/core/network/rpc_service";

publicWidget.registry.product_detail_view_3d = publicWidget.Widget.extend({
    selector: '.o_wsale_product_page',
    events: {
        'click .product_images': '_3dBtn',
        'click #ar_button': '_arBtn',
    },

    _onSlideCarouselProduct: function () {
        const self = this;
        $(document).ready(() => {
            const carousel = self.$el.find('.carousel');
            if (!carousel) {
                return;
            }
            const slide = carousel.find('.carousel-slide.active');
            if (!slide ||!slide.offset()) {
                return;
            }
            const left = slide.offset().left;
            // Resto del código...
        });
    },
        
    _3dBtn: function (ev) {
        var self = this;
        var target = this.$(ev.target);
        if (target.data('type') == "3d") {
            this.$('.o_carousel_product_outer').hide();
            this.$('#product_main').show();
            this.$('#product_main').html('<canvas class="view3d-canvas" style="height: 343px; width: 361px;"/>');
            this.$('#3d_image').addClass('active');
            this.$('#product_image').removeClass('active');
            var product_id = this.$("span[data-oe-model|='product.template']").data('oe-id');
            jsonrpc('/product/3d', {
                product_id: product_id
            }).then(function (data) {
                var val;
                if (data['3D_model'] !== false) {
                    val = `data:model/gltf-binary;base64, ${data['3D_model']}`;
                } else {
                    val = `/model_viewer_widget/static/src/assets/3d.glb`;
                }
                self.view3D = new View3D('#product_main', {
                    src: val
                });
                if (data['enable_ar']) {
                    self.$('#ar_button').show().data('model-src', val).data('tracking-type', data['tracking_type']);
                }
            }).catch(function (error) {
                console.error("Error loading 3D model:", error);
            });
        } else {
            this.$('.o_carousel_product_outer').show();
            this.$('#product_main').hide();
            this.$('#product_image').addClass('active');
            this.$('#3d_image').removeClass('active');
        }
    },
    _arBtn: function () {
        const arButton = this.$('#ar_button');
        if (arButton.length) {
            const modelSrc = arButton.data('model-src');
            const trackingType = arButton.data('tracking-type');
            this.loadArView(modelSrc, trackingType);
        } else {
            console.error("AR button not found.");
        }
    },
    loadArView: function (modelSrc, trackingType) {
        const script = document.createElement('script');
        script.src = 'https://aframe.io/releases/1.2.0/aframe.min.js';
        script.onload = () => {
            const arjsScript = document.createElement('script');
            arjsScript.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js';
            arjsScript.onload = () => {
                const sceneEl = document.createElement('a-scene');
                sceneEl.setAttribute('embedded', '');
                sceneEl.innerHTML = `
                    <a-marker preset="${trackingType}">
                        <a-entity gltf-model="${modelSrc}" scale="0.5 0.5 0.5"></a-entity>
                    </a-marker>
                    <a-entity camera></a-entity>
                `;
                const productMain = document.querySelector('#product_main');
                if (productMain) {
                    productMain.appendChild(sceneEl);
                } else {
                    console.error("Product main element not found.");
                }
            };
            document.body.appendChild(arjsScript);
        };
        document.body.appendChild(script);
        },
})
