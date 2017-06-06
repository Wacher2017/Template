var tab=function(){
    $(".tab-menu li").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
        var index = $(this).index();
        $(".tab-con .tab01").eq(index).show().siblings().hide();
    });
};

//var tab01=function(){
//    $(".js-tab01").click(function(){
//        $(this).addClass("active").siblings().removeClass("active");
//       var index = $(".tab-menu").index();
//        $(".tab-con").eq(index).show();
//    });
//};