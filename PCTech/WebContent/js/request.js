/* theseus instrument: false */
/*jslint browser: true*/
/*global $, jQuery, console, ActiveXObject, alert*/

// 自定义脚本运行在一个匿名函数内，便于文件合并
(function () {

    // use strict mode
    "use strict";

    var xmlHttpRequest, /* http请求对象*/
        //parkinglot_list, /* 停车场列表对象*/
        layout_cols, /* 停车场车位列数*/
        layout_rows, /* 停车场车位行数*/
        mydropdown, layout;

    $(document).ready(function () {

        getLotList("assets/parkinglot_list.json");

    });

    /*
    <li role='presentation' value='xxxplot'>
        <a role='menuitem' tabindex='1' href='javascript:void(0);'>xxxplot</a>
    </li>
    */
    function getLotList(url) {

        $.getJSON(url).done(function (data) {
            var parkinglot_list = [];
            data.forEach(function (value, index) {
                parkinglot_list.push("<li role='presentation' value='");
                parkinglot_list.push(value);
                parkinglot_list.push("'><a role='menuitem' tabindex='");
                parkinglot_list.push(index + 1);
                parkinglot_list.push("' href='javascript:void(0);'>");
                parkinglot_list.push(value);
                parkinglot_list.push("</a></li>");
            });
            $("#parkinglot-list").html(parkinglot_list.join(''));
            mydropdown = new CustomDropDown($("#select-dropdown-menu-1"));
        }).fail(function () {
            console.log("getLotList error");
        });
    }

    function getLayout(url) {
        return $.get(url).done(function (data) {
            layout_rows = parseInt($(data).find('rows').text());
            layout_cols = parseInt($(data).find('cols').text());

            layout = new Array(layout_rows);
            console.log(layout.length);
            for (var i = 0; i < layout.length; i++) {
                layout[i] = new Array(layout_cols);
                console.log(layout[i].length);
            }
        }).fail(function () {
            console.log("getLayout error");
        });
    }
    var spots;

    function getParkinglot(url) {
        return $.getJSON(url).done(function (data) {
            setBulletin(data);
            spots = data.parkingSpots[0];
            data.parkingSpots.forEach(function (value, index) {
                var reg = /(\w+\d+)-(\d+)-(\d+)/g,
                    result = reg.exec(value.id),
                    i = parseInt(result[2]),
                    j = parseInt(result[3]);
                layout[i][j] = true;
            });

            setTableLot();
        }).fail(function () {
            console.log("getLotList error");
        });
    }

    function log(data) {
        $("#log").html(JSON.stringify(data));
    }

    function onParkinglotSelected(lotname) {
        getLayout("layout/layout_" + lotname + ".xml")
            .then(getParkinglot("assets/" + lotname + ".json"));
    }

    /*  tablelot生成如下html代码
        <div class="table-responsive">
            <table class="table table-striped table-bordered table-hover">
                <tbody>
                    <tr>
                        <td class="empty">empty</td>
                        <td class="empty">empty</td>
                        <td class="empty">empty</td>
                        <td class="car car11">busy</td>
                        <td class="empty">empty</td>
                        <td class="empty">empty</td>
                    </tr>
                </tbody>
            </table>
        </div>
    */
    function setTableLot() {
        // 设置tablelot
        var table = [];
        table.push("<div class='table-responsive'><table class='table table-striped table-bordered table-hover'><tbody>");
        for (var i = 0; i < layout_rows; i++) {
            table.push("<tr>");
            for (var j = 0; j < layout_cols; j++) {
                if (layout[i][j] !== true)
                    table.push("<td class='empty'></td>");
                else
                    table.push("<td class='car car1'></td>");
            }
            table.push("</tr>");
        }
        table.push("</tbody></table></div>");
        $("#tablelot").html(table.join(''));
    }

    /* bulletin内生成代码模版
    <table class="table table-hover">
    <thead>
        <tr>
            <th colspan="4">名称：
                <span></span>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="col-md-2">结构型式：</td>
            <td class="col-md-4"></td>
            <td class="col-md-2">营业时间：</td>
            <td class="col-md-4"></td>
        </tr>
        <tr>
            <td>服务对象：</td>
            <td></td>
            <td>主要设施：</td>
            <td></td>
        </tr>
        <tr>
            <td>车位总数：</td>
            <td></td>
            <td>剩余车位数：</td>
            <td></td>
        </tr>
        <tr>
            <td>收费标准：</td>
            <td></td>
            <td>地址：</td>
            <td></td>
        </tr>
    </tbody>
    </table>
    */
    function setBulletin(parkinglot) {
        // 设置bulletin
        var bulletin = [];
        bulletin.push("<table class='table table-hover'><thead><tr><th colspan='4'>名称：<span>");
        bulletin.push(parkinglot.name);
        bulletin.push("</span></th></tr></thead><tbody><tr><td class='col-md-2'>结构型式：</td><td class='col-md-4'>");
        bulletin.push(parkinglot.architecture);
        bulletin.push("</td><td class='col-md-2'>营业时间：</td><td class='col-md-4'>");
        bulletin.push(parkinglot.businessHours);
        bulletin.push("</td></tr><tr><td>服务对象：</td><td>");
        bulletin.push(parkinglot.client);
        bulletin.push("</td><td>主要设施：</td><td>");
        bulletin.push(parkinglot.facility);
        bulletin.push("</td></tr><tr><td>车位总数：</td><td>");
        bulletin.push(parkinglot.spotQuantity);
        bulletin.push("</td><td>剩余车位数：</td><td>");
        bulletin.push(parkinglot.spotQuantity - parkinglot.parkingSpots.length);
        bulletin.push("</td></tr><tr><td>收费标准：</td><td>");
        bulletin.push(parkinglot.fee);
        bulletin.push("</td><td>地址：</td><td>");
        bulletin.push(parkinglot.address);
        bulletin.push("</td></tr></tbody></table>");

        $("#bulletin").html(bulletin.join(''));
    }

    function LoadData(url) {
        if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlHttpRequest = new XMLHttpRequest();
        } else { // code for IE6, IE5
            xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlHttpRequest.onreadystatechange = function () {
            if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status === 200) {
                document.getElementById("hello ").innerHTML = xmlHttpRequest.responseText;
            }
        };

        xmlHttpRequest.open("GET ", url, true);
        xmlHttpRequest.send();
    }

    function selectLot(value) {
        var tablelot = document.getElementById("tablelot");
        if (value <= 0) {
            return;
        }

        if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlHttpRequest = new XMLHttpRequest();
        } else { // code for IE6, IE5
            xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlHttpRequest.onreadystatechange = function () {
            if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status === 200) {
                var xmlDoc = xmlHttpRequest.responseXML,
                    layoutTag = xmlDoc.getElementsByTagName("layout"),
                    cols = xmlDoc.getElementsByTagName("layout ")[0].getElementsByTagName("cols")[0].firstChild.nodeValue,
                    rows = xmlDoc.getElementsByTagName("layout ")[0].getElementsByTagName("rows")[0].firstChild.nodeValue,
                    table = document.createElement("table"),
                    tbody = document.createElement("tbody");
                for (var i = 0; i < rows; i++) {
                    var tr = document.createElement("tr");
                    for (var j = 0; j < cols; j++) {
                        var td = document.createElement("td");

                        var txt = getRandomStatus();
                        if (txt === "busy") {
                            td.className = "car car" + getRandomCar(12);
                        } else {
                            td.className = "empty";
                        }
                        //td.appendChild(document.createTextNode(txt));
                        tr.appendChild(td);
                    }
                    tbody.appendChild(tr);
                }
                table.appendChild(tbody);
                table.className = "table table-striped table-bordered table-hover";
                tablelot.innerHTML = "";
                var divTag = document.createElement("div");
                divTag.className = "table-responsive ";
                divTag.appendChild(table);
                tablelot.appendChild(divTag);
            }
        };

        // 提取停车场号码
        //var lotnum = value.substr(3);

        xmlHttpRequest.open("GET", "layout/layout_yyyplot.xml", true);
        xmlHttpRequest.send();
    }

    function getRandomCar(scope) {
        return Math.ceil(Math.random() * 10000) % scope + 1;
    }

    function getRandomStatus() {
        return Math.ceil(Math.random() * 1000) % 2 === 0 ? "empty" : "busy";
    }

    /*
        ParkingSpot类型
    */
    function ParkingSpot(pfx, row, col) {
        this.pfx = pfx;
        this.row = row;
        this.col = col;
    }

    /* ========================================================================
     * 基于bootstrap按钮式下拉菜单的自定义的类select控件
     *
     * ======================================================================== */
    function CustomDropDown(element) {
        this.dropdown = element;
        this.placeholder = this.dropdown.find(".placeholder");
        this.options = this.dropdown.find("ul.dropdown-menu>li");
        this.val = '';
        this.index = -1; //默认为-1;
        this.initEvents();
    }
    CustomDropDown.prototype = {
        initEvents: function () {
            var obj = this;
            //这个方法可以不写，因为点击事件被Bootstrap本身就捕获了，显示下面下拉列表
            obj.dropdown.on("click", function (event) {
                $(this).toggleClass("active");
            });

            //点击下拉列表的选项
            obj.options.on("click", function () {
                var opt = $(this);
                obj.text = opt.find("a").text();
                obj.val = opt.attr("value");
                obj.index = opt.index();
                obj.placeholder.text(obj.text);
                onParkinglotSelected(obj.val);
                //selectLot(obj.val);
            });
        },
        getText: function () {
            return this.text;
        },
        getValue: function () {
            return this.val;
        },
        getIndex: function () {
            return this.index;
        }
    };
})();
