// Analyzify Shopify Pixels - GA4 v1.0 - learn more on https://analyzify.app/shopify-pixels
// DO NOT forget updating G-XXXXXXXXXX with your own GA4 measurement ID - learn more on https://docs.analyzify.app/find-your-google-analytics-tracking-id
const TRACKING_ID = "G-XXXXXXXXXX";
const script = document.createElement("script");
script.setAttribute(
    "src",
    `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`
);
script.setAttribute("async", "");
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", TRACKING_ID, { send_page_view: false });

const Analyzify = {
  getItemsFromLineItems(lineItems) {
    let items = [];
    for (const item of lineItems) {
      items.push({
        item_id: item.variant.sku, //Custom - Use SKU
        item_name: item.variant.product.title,
        price: item.finalLinePrice.amount / item.quantity, //Custom - Add unit price after discounts have been applied
        quantity: item.quantity, //Custom - Add Quantity
        item_variant: item.variant.title, //Custom - Add Variant Title
        discount: item.variant.price.amount - item.finalLinePrice.amount / item.quantity, //Custom - add unit discount amount
      })
    }

    return items;
  },

  getPageViewData(evt) {
    let ctx = evt.context;
    return {
      page_location: ctx.document.location.href,
      page_title: ctx.document.title,
      // language: ctx.language, // Custom disable language unless required for multi-market stores
    };
  },

  getViewItemData(evt) {
    return {
      currency: evt.data.productVariant.price.currencyCode,
      value: evt.data.productVariant.price.amount,
      items: [
        { item_id: evt.data.productVariant.sku, // Custom - Use SKU
          item_name: evt.data.productVariant.product.title,
          item_variant: evt.data.cartLine.merchandise.title, 
        }
      ],
    };
  },

  getCollectionViewData(evt) {
    return {
      collection_id: evt.data.collection.id,
      collection_name: evt.data.collection.title,
    }
  },

  getAddToCartData(evt) {
    return {
      currency: evt.data.cartLine.merchandise.price.currencyCode,
      value: evt.data.cartLine.merchandise.price.amount * evt.data.cartLine.quantity, // Custom - multiply price by quantity to get total value
      items: [{ 
        item_id: evt.data.cartLine.merchandise.sku, 
        item_name: evt.data.cartLine.merchandise.product.title, 
        price: evt.data.cartLine.merchandise.price.amount, 
        quantity: evt.data.cartLine.quantity,
        item_variant: evt.data.cartLine.merchandise.title,
        }], // Custom - Use SKU for item id and add paramters for price, quantity, and variant title
    }
  },

  getPaymentInfoData(evt) {
    return {
      currency: evt.data.checkout.currencyCode,
      value: evt.data.checkout.totalPrice.amount,
      items: this.getItemsFromLineItems(evt.data.checkout.lineItems),
    };
  },

  getCheckoutData(evt) {
    return {
      currency: evt.data.checkout.currencyCode,
      value: evt.data.checkout.totalPrice.amount,
      items: this.getItemsFromLineItems(evt.data.checkout.lineItems),
    };
  },

  getCheckoutCompleteData(evt) {
    return {
      transaction_id: evt.data.checkout.order.id,
      currency: evt.data.checkout.currencyCode,
      value: evt.data.checkout.totalPrice.amount,
      items: this.getItemsFromLineItems(evt.data.checkout.lineItems),
    };
  },
};


analytics.subscribe("page_viewed", async (event) => {
  gtag("event", "page_view", Analyzify.getPageViewData(event));
});

analytics.subscribe("product_viewed", async (event) => {
  gtag("event", "view_item", Analyzify.getViewItemData(event));
});

analytics.subscribe("collection_viewed", async (event) => {
  gtag("event", "collection_view", Analyzify.getCollectionViewData(event));
});

analytics.subscribe("search_submitted", async (event) => {
  gtag("event", "search", {
    search_term: event.data.searchResult.query,
  });
});

analytics.subscribe("product_added_to_cart", async (event) => {
  gtag("event", "add_to_cart", Analyzify.getAddToCartData(event));
});

analytics.subscribe("payment_info_submitted", async (event) => {
  gtag("event", "add_payment_info", Analyzify.getPaymentInfoData(event));
});

analytics.subscribe("checkout_started", async (event) => {
  gtag("event", "begin_checkout", Analyzify.getCheckoutData(event));
});

analytics.subscribe("checkout_completed", async (event) => {
  gtag("event", "purchase", Analyzify.getCheckoutCompleteData(event));
});
