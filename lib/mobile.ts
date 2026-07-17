export const isMobileApp = () => {
    if (typeof window === "undefined") return false;
  
    return navigator.userAgent.includes("InventoryMobile");
  };