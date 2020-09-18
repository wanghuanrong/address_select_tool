
// 得到输入框然后自动生成父节点、兄弟节点
// 参数1 name:输入框名称    参数2  width：输入框宽度  参数3  first_division:固定的最初允许选择的区划编码  参数4  backward_num:固定的最后允许选择的等级
function generateNode(name, width, first_division, backward_num) {
    $("#" + name).css("width", width);
    $("#" + name).wrap('<div class="dis_content"></div>');
    $("#" + name).parent().wrap('<div class="egarea" eg-name=' + name + '></div>');
    var dis_select_push = '<div class="dis_select">\
                                <div class="dis_tab_list">\
                                    <a href = "javascript:;" tab = "province" class="bor_red" > 请选择</a >\
                                </div >\
                                    <div class="address_ul"></div>\
                                </div >\
                            </div > ';
    $("#" + name).parent().after(dis_select_push);

    // ----鼠标进入显示区
    $("#" + name).focus(function () {
        $(".dis_select").hide();
        $(this).parent().next().show();

        // 判断选择框右边是否超出body宽度，超过时右对齐
        var body_w = document.body.offsetWidth;
        var input_w = this.offsetWidth;
        var obj_left = getPoint(this.parentNode.nextSibling)[1];
        var obj_w = this.parentNode.nextSibling.offsetWidth;

        var yidong_left = -(obj_w - input_w);
        if (obj_left + obj_w > body_w) {
            console.log("超过了！");
            $(this).parent().next().css("left", yidong_left + "px");
        }

        // 判断选择框下边是否超出body宽度，超过时上对齐
        // var body_h = $(document.body).height();
        // var input_h = $(this).height();
        // var obj_top = $(this).parent().next().offset().top;
        // var obj_h = this.parentNode.nextSibling.offsetHeight;

        // var yidong_top = -(obj_h);
        // console.log(body_h  ,  input_h  ,  obj_top  ,obj_h  ,yidong_top);
        // if (obj_top + obj_h > body_h) {
        //     console.log("超过了！");
        //     $(this).parent().next().css("top", yidong_top + "px");
        // }


        address_list_width();
    });

    // tab选项栏点击事件
    tab_click();

    //               -----------------------省份选项卡代码---------------------
    // -----拼接省份
    var province = getDistrict("1", "");
    // console.log(province);
    var province_push = "<div class='dis_ul_div province'><ul class='ul_list'>"
    for (let i = 0; i < province.rows.length; i++) {
        province_push += "<li><a data_id='" + province.rows[i].code + "' href='javascript:;''>" + province.rows[i].name + "</a></li>"
    }

    province_push += "</div></ul>"
    $("[eg-name=" + name + "] .address_ul").html(province_push);
    // 默认选择第一个，并显示成红色
    // $("[eg-name=" + name + "] .address_ul .dis_ul_div .ul_list li:first").addClass("current");

    // 用于选择选择最开始地区，传入行政区划，生成地址，隐藏前面的选择
    console.log(first_division);
    var ancestor_dis = [first_division];
    // 当前所在区划,通过up_obtoin方法得到上一级行政区划，得到所有上级区划，并存在数组中
    for (var i = 0; i < 10; i++) {
        if (up_obtoin(ancestor_dis[0]) != "" && up_obtoin(ancestor_dis[0]) != undefined) {
            ancestor_dis.unshift(up_obtoin(ancestor_dis[0]));
        } else {
            break;
        }
    }
    console.log(ancestor_dis);



    if (ancestor_dis != "" && ancestor_dis != undefined) {
        // 省
        var first_dis_province = ancestor_dis[0];
        console.log(first_dis_province);
        if (first_dis_province != undefined) {
            initial_tab(first_dis_province, "province");
            initial_render("province", "2", "city", first_dis_province);
            local_click("city", "3", "county", county_click);
            ancesotr_if_lost("1", "province", first_dis_province);
        }

        // 市
        var first_dis_city = ancestor_dis[1];
        if (first_dis_city != undefined) {

            initial_tab(first_dis_city, "city");
            initial_render("city", "3", "county", first_dis_city);
            local_click("county", "4", "township", township_click);
            ancesotr_if_lost("2", "city", first_dis_city);
        }
        // 县
        var first_dis_county = ancestor_dis[2];
        if (first_dis_county != undefined) {
            initial_tab(first_dis_county, "county");
            initial_render("county", "4", "township", first_dis_county);
            local_click("township", "5", "village", village_click);
            ancesotr_if_lost("3", "county", first_dis_county);

        }
        // 镇
        var first_dis_township = ancestor_dis[3];
        console.log(first_dis_township);
        if (first_dis_township != undefined) {
            initial_tab(first_dis_township, "township");
            initial_render("township", "5", "village", first_dis_township);
            local_click("village", "6", "group", group_click);
            ancesotr_if_lost("4", "township", first_dis_township);
        }
        // 村
        var first_dis_village = ancestor_dis[4];
        console.log(first_dis_village);
        if (first_dis_village != undefined) {
            initial_tab(code_village, "village");
            initial_render("village", "6", "group", code_village);
            local_click("group", "7", "", function () {
                console.log("成功！");
            });
            ancesotr_if_lost("5", "village", first_dis_village);
        }
    }





    // 当最初获取到区划编码         ---------------------初始化地址输入框-------------------
    var local_code = $("#" + name).val();
    var initial_value = [local_code];
    for (var i = 0; i < 10; i++) {
        if (up_obtoin(initial_value[0]) != "" && up_obtoin(initial_value[0]) != undefined) {
            initial_value.unshift(up_obtoin(initial_value[0]));
        } else {
            break;
        }
    }
    console.log(initial_value);

    // 固定最多可选的区划等级
    if (backward_num != "" && backward_num != undefined) {
        var back_i = Number(backward_num);
        initial_value.splice(back_i, initial_value.length);
    }
    console.log(initial_value);

    if (initial_value != "" && initial_value != undefined) {
        // 自动填写省级地区
        var code_province = initial_value[0];
        if (code_province != undefined) {
            if (!($("[eg-name=" + name + "] .dis_select .address_ul .city").length > 0)) {
                initial_tab(code_province, "province");
                if(!(initial_value[1] == undefined)){
                    initial_render("province", "2", "city", code_province);
                }
                local_click("city", "3", "county", county_click);
            }
        }
        // 自动填写市级地区
        var code_city = initial_value[1];
        if (code_city != undefined) {
            if (!($("[eg-name=" + name + "] .dis_select .address_ul .county").length > 0)) {
                initial_tab(code_city, "city");
                if(!(initial_value[2] == undefined)){
                    initial_render("city", "3", "county", code_city);
                }
                local_click("county", "4", "township", township_click);
            }

        }

        // 自动填写县级地区
        var code_county = initial_value[2];
        if (code_county != undefined) {
            if (!($("[eg-name=" + name + "] .dis_select .address_ul .township").length > 0)) {
                initial_tab(code_county, "county");
                if(!(initial_value[3] == undefined)){
                    initial_render("county", "4", "township", code_county);
                }
                local_click("township", "5", "village", village_click);
            }
        }
        // 自动填写镇级地区
        var code_township = initial_value[3];
        if (code_township != undefined) {
            if (!($("[eg-name=" + name + "] .dis_select .address_ul .village").length > 0)) {
                initial_tab(code_township, "township");
                if(!(initial_value[4] == undefined)){
                    initial_render("township", "5", "village", code_township);
                }
                local_click("village", "6", "group", group_click);
            }

        }
        // 自动填写村级地区
        var code_village = initial_value[4];
        if (code_village != undefined) {
            if (!($("[eg-name=" + name + "] .dis_select .address_ul .group").length > 0)) {
                initial_tab(code_village, "village");
                if(!(initial_value[5] == undefined)){
                    initial_render("village", "6", "group", code_village);
                }
                
                local_click("group", "7", "", function () {
                    console.log("成功！");
                });
            }

        }
        // 自动填写小组地区
        var code_group = initial_value[5];
        if (code_group != undefined) {
            initial_tab(code_group, "group");
            initial_render("group", "6", "", code_group);
        }

        // 用来得到tab中的文字，方便拼接
        if (local_code != "") {
            var initial_name = "";
            $("[eg-name=" + name + "] .dis_tab_list a").each(function () {
                initial_name += $(this).html();
            });
            $("#" + name).val(initial_name);
        }
    }



    // -----------------调用点击事件方法----------------

    // 省
    local_click("province", "2", "city", city_click);

    // 市
    function city_click() {
        local_click("city", "3", "county", county_click);
    }

    // 县
    function county_click() {
        local_click("county", "4", "township", township_click);
    }

    // 镇
    function township_click() {
        local_click("township", "5", "village", village_click);
    }

    // 村
    function village_click() {
        local_click("village", "6", "group", group_click);
    }

    // 组
    function group_click() {
        local_click("group", "7", "", function () {
            console.log("成功！");
        });
    }



    // 参数：local 地域等级  、   tab_num   第几个tab
    function local_click(local, tab_num, next_local, next_fun) {
        $("[eg-name=" + name + "] .address_ul ." + local + " .ul_list li a").click(local_node_click);
        function local_node_click() {
            // 得到单击事件省份名称
            var local_name = $(this).html();
            var local_data_id = $(this).attr("data_id");
            $("[eg-name=" + name + "] .dis_tab_list a[tab='" + local + "']").nextAll().remove();

            // 将选项卡tab变化
            $("[eg-name=" + name + "] .dis_tab_list a[tab='" + local + "']").html(local_name);
            $("[eg-name=" + name + "] .address_ul ." + local + " .ul_list li").each(function () {
                if ($(this).attr("class") == "current") {
                    $(this).removeClass("current");
                }
            });
            $(this).parent().addClass("current");


            // 得到行政区划  (注：由于区域登记的data_id 和 tab_num 一样，所以用tab_num代替)
            var next_local_data = getDistrict(tab_num, $(this).attr('data_id'));
            // console.log(next_local_data);


            // 用来得到tab中的文字，方便拼接
            var return_name = "";

            $("[eg-name=" + name + "] .dis_tab_list a").each(function () {
                return_name += $(this).html();
            });
            $("#" + name).val(return_name);
            $("#" + name).attr("data_id", local_data_id);


            // 固定最多可选的区划等级
            if (backward_num != "" && backward_num != undefined) {
                console.log(level_c(backward_num));
                if (local == level_c(backward_num)) {
                    $("[eg-name=" + name + "] .dis_select").hide();
                    return false;
                }
            }

            //  如果没有得到行政区划，说明后面没有登记结束代码
            if (next_local_data.total == 0) {
                console.log("后面没有了！");
                $("[eg-name=" + name + "] .dis_select").hide();
                return false;
            } else {
                // 生成地址函数
                tab_address_main(local, tab_num, next_local, next_local_data);
            }
            address_list_width();
            next_fun();
        }
    }


    // -----选项卡tab点击事件
    function tab_click() {
        $("[eg-name=" + name + "] .dis_tab_list a").click(function () {
            $("[eg-name=" + name + "] .dis_tab_list a").each(function () {
                if ($(this).attr("class") == "bor_red") {
                    $(this).removeClass("bor_red");
                }
            });
            $(this).addClass("bor_red");
            $("[eg-name=" + name + "] .address_ul .dis_ul_div").hide();

            var tab_name = $(this).attr("tab");
            $("[eg-name=" + name + "] ." + tab_name).show();
        });
    }

    function address_list_width() {
        // 设置地址li的宽度
        $("[eg-name=" + name + "] .address_ul .dis_ul_div .ul_list li").each(function () {
            if ($(this).width() <= 100) {
                $(this).width(100);
            } else {
                $(this).width(200);
                $(this).css({ "padding-left": "4px", "padding-right": "4px" });
            }
        });
    }


    function ancesotr_if_lost(num, local, first_local) {
        if (ancestor_dis[num] == undefined) {
            $("[eg-name=" + name + "] .address_ul ." + local + " .ul_list li").hide();
            $("[eg-name=" + name + "] .address_ul ." + local + " .ul_list li a[data_id=" + first_local + "]").parent().show();
        } else {
            $("[eg-name=" + name + "] .dis_tab_list a[tab=" + local + "]").hide();
        }
    }


    // 初始化tab
    function initial_tab(code, local) {
        $("[eg-name=" + name + "] .address_ul ." + local + " .ul_list li").each(function () {
            if ($(this).attr("class") == "current") {
                $(this).removeClass("current");
            }
        });
        // 得到该行政区划的节点
        var address_list_a = $("[eg-name=" + name + "] .address_ul .dis_ul_div .ul_list li a[data_id=" + code + "]");
        address_list_a.parent().addClass("current");
        $("[eg-name=" + name + "] .dis_tab_list a[tab='" + local + "']").html(address_list_a.html());
    }

    // 初始化地址选择
    function initial_render(local, tab_num, next_local, getDis) {
        var getDis_num = getDistrict(tab_num, getDis);
        // console.log(getDis_num);
        if (getDis_num.total == 0 ) {
            console.log("后面没有了！");
            return false;
        } else {
            tab_address_main(local, tab_num, next_local, getDis_num);
        }

    }


    // tab 和 地址生成 （重要代码）
    function tab_address_main(local, tab_num, next_local, data) {

        if ($("[eg-name=" + name + "] .dis_tab_list a:nth-child(" + tab_num + ")").attr("tab") != next_local) {
            $("[eg-name=" + name + "] .dis_tab_list").append("<a href='javascript:;' tab='" + next_local + "'>请选择</a>");
            tab_click();
        }

        $("[eg-name=" + name + "] .dis_tab_list a").each(function () {
            if ($(this).attr("class") == "bor_red") {
                $(this).removeClass("bor_red");
            }
        });
        $("[eg-name=" + name + "] .dis_tab_list a:nth-child(" + tab_num + ")").addClass("bor_red");
        $("[eg-name=" + name + "] .address_ul ." + local + "").hide();


        // 添加选择内容
        $("[eg-name=" + name + "] .address_ul ." + next_local + "").remove();
        $("[eg-name=" + name + "] .address_ul").append("<div class='dis_ul_div " + next_local + "'><ul class='ul_list'></ul></div>");
        var county_push = "";
        for (let i = 1; i < data.rows.length; i++) {
            county_push += "<li><a data_id='" + data.rows[i].code + "' href='javascript:;''>" + data.rows[i].name + "</a></li>";
        }
        $("[eg-name=" + name + "] .address_ul ." + next_local + " .ul_list").append(county_push);

        address_list_width();

    }


    // 点击除该元素之外的地方（取消冒泡事件）
    $(document).click(function () {
        $("[eg-name=" + name + "] .dis_select").hide();
    });
    $(".egarea[eg-name=" + name + "]").click(function (event) {
        event.stopPropagation();

    });

    function level_c(level) {
        if (level == "1") {
            return "province";
        }
        else if (level == "2") {
            return "city";
        }
        else if (level == "3") {
            return "county";
        }
        else if (level == "4") {
            return "township";
        }
        else if (level == "5") {
            return "village";
        }
        else if (level == "6") {
            return "group";
        }
    }

    function getPoint(obj) { //获取某元素以浏览器左上角为原点的坐标
        var t = obj.offsetTop; //获取该元素对应父容器的上边距
        var l = obj.offsetLeft; //对应父容器的上边距
        //判断是否有父容器，如果存在则累加其边距
        while (obj = obj.offsetParent) {//等效 obj = obj.offsetParent;while (obj != undefined)
            t += obj.offsetTop; //叠加父容器的上边距
            l += obj.offsetLeft; //叠加父容器的左边距
        }
        return [t, l];
    }
}


