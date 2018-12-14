function onload(cfg){
    for(var i = 0; i < cfg.length; i++){
        Xrm.Page.getAttribute(cfg[i].attr).setRequiredLevel(cfg[i].level);
    }
}