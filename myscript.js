/**
 * Created by baosisi on 2017/2/27.
 */

$(function(){
    var map = new AMap.Map('container',{
        zoom: 11
    });
    $.ajax({
        type: "get",
        url: url+'/device/loadDeviceList',
        success:function(data){
            data=JSON.parse(data);
            if(data.flag=="00-00"){
                var center=data.controlCenter.split(",");
                map.setCenter(center);
                loadMarker(data.datas);

            }
        }
    });

    //添加右键菜单
    var addMarkerMenuList=function (marker,code,name,state) {
        var contextMenu = new AMap.ContextMenu(),
            contextMenuPositon = null;//创建右键菜单
        var content = [];
        content.push("<div>");
        content.push("    <ul class='context_menu' id='"+code+"'>");
        content.push("        <li  class='screenBasic basic_btn'>基本信息</li>");
        content.push("        <li class='btnPublish publish_btn'>内容发布</li>");
        content.push("        <li class='btnState status_btn'>设备状态</li>");
        content.push("        <li class='btnSetting setting_btn'>基础设置</li>");
        content.push("        <li class='btnWarning warning_btn'>告警信息</li>");
        content.push("        <li  class='dropdown-toggle' data-toggle='dropdown' data-hover='dropdown' data-close-others='true'>操作</li>");
        content.push("            <ul class='dropdown-menu dropdown-menu-default'>");
        content.push("<li data-toggle='modal' class='screen_btn' href='#conduct'><a href='javascript:;'>屏幕操作</a></li>");
        content.push("<li data-toggle='modal' class='light_btn' href='#conductL'><a href='javascript:;'>亮度控制</a></li>");
        content.push("<li data-toggle='modal' class='dj_btn' href='#dianjian'><a href='javascript:;'>点检</a></li>");
        content.push("<li  id='btnReset' class='reset_btn'><a href='javascript:;'>设备复位</a></li>");
        content.push("<li data-toggle='modal' id='btnRecover' class='recover_btn'><a href='javascript:;'>恢复出厂设置</a></li>");
        content.push("<li data-toggle='modal' class='virtual_btn' href='#virtual'><a href='javascript:;'>设置虚拟连接</a></li>");
        content.push("<li data-toggle='modal' class='fileClean_btn' href='#fileClean'><a href='javascript:;'>文件清理</a></li>");
        content.push("<li data-toggle='modal' class='temperature_btn' href='#temperature'><a href='javascript:;'>温度过高操作</a></li>");
        content.push("<li data-toggle='modal' class='powerUnusual_btn' href='#powerUnusual'><a href='javascript:;'>电源异常操作</a></li>");

        content.push("</ul>");
        content.push("    </ul>");
        content.push("</div>");
        contextMenu = new AMap.ContextMenu({isCustom: true, content: content.join('')});
        marker.setExtData({"id":code,"state":state});
        //        鼠标左击事件
        marker.on('click', function(e) {
            var screenId=marker.getExtData();
        if(screenId.state==5){
            alert("诱导屏未连接！");
        }else {
            $("#playList").attr("data-id",screenId.id);
            $("#playList").modal("show");
            obtainPlayList(screenId.id);
            sessionStorage.setItem("screenCode",screenId.id);
           
        }
            
        });
        marker.setTitle(name);
        //        鼠标右击事件
        marker.on('rightclick', function(e) {
            contextMenu.open(map, e.lnglat);
            contextMenuPositon = e.lnglat;
            controlPageShow();
        });
    };
    //内容发布
    $(document).on("click",".btnPublish",function(){
        $("#publish").modal("show");
        var screenId=$(this).parents(".context_menu").attr("id");
        $("#publish").attr("data-id",screenId);
        $(".pushScreen").text(screenId);
    });
    //获取基本信息
    $(document).on("click",".screenBasic",function(){
        $("#basic").modal("show");
        $("#basic .modal-title").text("基本信息");
        $(".btn-basic").removeAttr("id");
        var screenId=$(this).parents(".context_menu").attr("id");
        $("#basic").attr("data-id",screenId);
        showBasic(screenId);
    });
    //获取设备状态
    $(document).on("click",".btnState",function(){
        $("#state").modal("show");
        $("#state .stateInfo").text("");
        var screenId=$(this).parents(".context_menu").attr("id");
        showState(screenId);
    });
    //获取属性设置
    $(document).on("click",".btnSetting",function(){
        $("#setting").modal("show");
        $("#setting input").val("");
        var screenId=$(this).parents(".context_menu").attr("id");
        sessionStorage.setItem("code",screenId);
       showSetting(screenId);
    });
    //获取告警信息
    $(document).on("click",".btnWarning",function(){
        $("#warning").modal("show");
        var screenId=$(this).parents(".context_menu").attr("id");
       showWarning(screenId);
    });
//        批量添加marker
    var loadMarker=function(datas){
        var marker=[];
        for(var i= 0,l=datas.length;i<l;i++){
            marker[i]="marker"+i;
            marker[i]=new AMap.Marker({ //添加自定义点标记
                map: map,
                position: datas[i].lnglat.split(","), //基点位置
                offset: new AMap.Pixel(-16, -15), //相对于基点的偏移位置
                content: '<img class="icon" src="'+url1+'/smart-traffic/assets/admin/layout/img/images/'+datas[i].type+'-'+datas[i].state+'.png" alt=""/>'   //自定义点标记覆盖物内容
            });
            addMarkerMenuList(marker[i],datas[i].id,datas[i].name,datas[i].state);

        }
    };
//        任意点右击事件
    var menu=new ContextMenu(map);
    function ContextMenu(map) {
        var me = this;
        this.contextMenuPositon = null;
        var content1 = [];
        content1.push("<div>");
        content1.push("    <ul class='context_menu'>");
        content1.push("        <li  id='addScreen'>新建诱导屏</li>");
        content1.push("    </ul>");
        content1.push("</div>");
        this.contextMenu = new AMap.ContextMenu({isCustom: true, content: content1.join('')});//通过content自定义右键菜单内容
        //地图绑定鼠标右击事件——弹出右键菜单
        map.on('rightclick', function(e) {
            me.contextMenu.open(map, e.lnglat);
            me.contextMenuPositon = e.lnglat; //右键菜单位置

        });
        $(document).on("click","#addScreen",function(){
            $("#basic").modal("show");
            $("#basic").find("input").val("").removeAttr("checked").parent("span").removeClass("checked");
            $("#basic").find("select").val("").removeAttr("disabled");
            $('#input_ipv4').ipAddress();
            $("#basic .modal-title").text("新建诱导屏");
            $(".btn-basic").attr("id","new");
            $("#location").val(me.contextMenuPositon);
        })
    }
    ContextMenu.prototype.addMarkerMenu=function () {
    var iconType=sessionStorage.getItem("iconType");      //右键菜单添加Marker标记
        var marker1 = new AMap.Marker({
            map: map,
            position: this.contextMenuPositon, //基点位置
            offset: new AMap.Pixel(-16, -15),
            content: '<img class="icon" src="'+url1+'/smart-traffic/assets/admin/layout/img/images/'+iconType+'-5.png" alt=""/>'
        });
        this.contextMenu.close();
        return marker1;
    };

     newScreen=function(){
         alert("创建成功！");
        $("#basic").modal("hide");
        var mark=menu.addMarkerMenu();
        addMarkerMenuList(mark);
        
    };
});





