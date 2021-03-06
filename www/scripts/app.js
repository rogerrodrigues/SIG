﻿/// <reference path="appSESTSENAT.js" />
/// <reference path="Jquery/jquery-2.1.1.min.js" />
/// <reference path="Jquery/jquery.loadTemplate-1.4.4.js" />
/// <reference path="Jquery/jquery-validate.js" />
/// <reference path="../appframework-2.1.0/build/appframework.js" />
/// <reference path="../appframework-2.1.0/build/jq.appframework.min.js" />
/// <reference path="../appframework-2.1.0/build/ui/appframework.ui.js" />

/// <reference path="../appframework-2.1.0/build/af.plugins.min.js" />
/// <reference path="../appframework-2.1.0/plugins/af.slidemenu.js" />

// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.

$.ui.useOSThemes = false;
$.ui.autoLaunch = true;
$.ui.backButtonText = "Voltar";
$.ui.openLinksNewTab = false;
$.ui.splitview = false;

if ($.os.ios) {
    $.feat.nativeTouchScroll = true;
    $("#afui").addClass("sest-ios");
}



var urlExterno = "http://extranet.sestsenat.org.br/sig";
var urlLocalhost = "http://extranet.sestsenat.org.br/sig";
//var urlLocalhost = "http://localhost:14934";

var progresso = new Number();
var maximo = new Number();
var progresso = 0;
var maximo = 7;


function start() {
    if ((progresso + 1) < maximo) {
        progresso = progresso + 1;
        document.getElementById("pg").value = progresso;
        setTimeout("start();", 200);
    } else {
        BindEventos();
    }
}

function onLoad() {
    if (window.cordova) {
        console.log("Cordova App");
        document.addEventListener('deviceready', onDeviceReady, false);
    } else {
        console.log("App sendo executado pelo browser Desktop");
        $(document).ready(function () {
            /*urlLocalhost = prompt("Informe o dominio", urlLocalhost);*/
            onDeviceReady();
        });
    }
}

function buscarDestaque() {
    inicioLoading("Buscando destaques...");
    setTimeout(function () {
        var destaques = "";
        for (var i = 0; i < 5; i++) {
            destaques += "<div class='destaque'> <div class='picture-destaque'></div> <h1>Titulo do Destaque</h1><hr /> " +
                "<p>Resumo do destaque varaias informaçoes inuteis para encher linguiça bla bla bla</p>" +
                "<p>Resumo do destaque varaias informaçoes inuteis para encher linguiça bla bla bla</p></div>";
        }
        $("div.box-destaque").append(destaques);
        fimLoading();
    }, 2000);
}
$.ui.ready(function () {
    $.ui.loadContent("#menuSest", false, false, "fade");
    //buscarDestaque();
    //$.ui.loadContent("#destaque", false, false, "fade");
    $.ui.blockPageScroll();

    Login();
    EnviarMensagem();
    SelecionaUnidade();

    var myScroller = $.ui.scrollingDivs['destaque'];
    myScroller.addInfinite();

    $.bind(myScroller, "infinite-scroll", function () {
        var self = this;
        if ($("#afui_mask:visible").length == 0) {
            console.log("infinite to refresh");
            $.unbind(myScroller, "infinite-scroll-end");
            self.scrollToBottom();
            setTimeout(function () {
                //$(self.el).append("<div>This was loaded via inifinite scroll<br>More Content</div>");
                buscarDestaque();
                self.scrollToBottom();
            });
        }
        $(self.el).find("#infinite").remove();
        self.clearInfinite();
    });

    $("#destaque").on("loadpanel", function () {
        if ($("div.destaque").length == 0)
            buscarDestaque();
    });

    $("#btTesteAjax").click(function () {
        alert("clickou");
        var url = (window.cordova ? urlExterno : urlLocalhost) + "/api/unidade/PesquisarPorUf";
        listaUnidade(url, "SP");
    });

    $("#btTesteVersion").click(function () {
        notificacao.vibrate(200);
        notificacao.beep(2);
        alert(
        "Name: " + device.name + "  \n " +
        "Cordova: " + device.cordova + " \n " +
        "Plataforma: " + device.platform + " \n " +
        "System Version: " + device.version + " \n ");

    });

    $("#btTesteConnection").click(function () {
        /*checkConnection();*/
        console.log("add offline");
        document.addEventListener("offline", checkConnection, false);
        console.log("add online");
        document.addEventListener("online", checkConnection, false);
    });

    $("#mapa").on("unloadpanel", function () {
        //$.ui.enableSideMenu();
        //$.ui.enableRightSideMenu();
    });

    $("#sobre").on("loadpanel", function () {
        LimparDados("#sobre");
        LimparValidacoes("#formEmail");

        $("#formEmail").validate();
        $("#emailFrom").rules("add", {
            required: true, email: true, messages: {
                required: "E-mail é Obrigatório",
                email: "Informe um e-mail válido"
            }
        });
        $("#nomeFrom").rules("add", {
            required: true, messages: {
                required: "Nome é Obrigatório",
            }
        });
        $("#emailBody").rules("add", {
            required: true, messages: {
                required: "Mensagem é Obrigatório",
            }
        });
    });

    $("#mapa").on("loadpanel", function (data) {
        //$.ui.disableSplitView();
        //$.ui.disableRightSideMenu();
        //$.ui.disableLeftSideMenu();
        setTimeout(function () {
            google.maps.event.trigger(map, "resize");
            centralizaMapa();
        }, 200);
    });

    $(".tabServicos li").click(function () {
        if (!$(this).hasClass("ativo")) {
            $(".conteudoServico div").hide();
            $("#" + $(this).attr("data-for")).parent().show();
            $("#" + $(this).attr("data-for")).fadeIn("fast");
            $(".tabServicos li").removeClass("ativo");
            $(this).addClass("ativo");
            $.ui.scrollToBottom("box-unidade", "400");
        }
    });
});

function FecharApp() {
    notificacao.confirm("Deseja realmente fechar o aplicativo?", function (button) {
        if (button == 2)
            exitApp();
    }, "Fechar app", "não,sim");
    //exitApp();    
}

function onDeviceReady() {
    /* Handle the Cordova pause and resume events*/
    document.addEventListener('pause', onPause.bind(this), false);
    document.addEventListener('resume', onResume.bind(this), false);
    if (window.cordova)
        navigator.splashscreen.hide()

    //start();
    //window.plugin.email.isServiceAvailable(function (isAvailable) {
    //    alert(isAvailable ? 'Service is available' : 'Service NOT available');
    //});

    //if (window.cordova)
    //    StatusBar.hide();
};

function onPause() {
};

function onResume() {
};

function BindEventos() {
    try {
        console.log("Bind on Device Ready");
        $.ui.launch();
    } catch (e) { alert("erro: " + e); };
}

function EnviarMensagem() {
    $("#btnEnviar").click(function (e) {
        e.preventDefault();
        if ($("#formEmail").valid()) {
            var url = (window.cordova ? urlExterno : urlLocalhost) + "/api/app/EnviarEmail";

            var request = $.ajax({
                url: url,
                type: 'GET',
                beforeSend: inicioLoading("Enviando E-Mail"),
                data: {
                    To: "rogercosta@sestsenat.org.br",
                    From: $("#emailFrom").val(),
                    Subject: $("#nomeFrom").val() + " - Fale Conosco " + formattedDate(null, true),
                    Body: $("#emailBody").val()
                },
                cache: false,
                dataType: 'json',
                success: function (data) {
                    LimparDados("#sobre");
                    fimLoading();
                    notificacao.confirm("Mensagem enviada com sucesso. Voltar para menu?", onConfirm, "Sucesso", "ok,cancelar");
                }, error: function (erro) {
                    notificacao.erroGenerico();
                }
            });
        }
        //window.plugin.email.open({
        //    to: ['rogercosta@sestsenat.org.br'],
        //    cc: ['rogr.df@gmail.com'],
        //    //bcc: ['john.doe@appplant.com', 'jane.doe@appplant.com'],
        //    subject: 'Teste',
        //    body: 'How are you? Nice greetings from Leipzig'
        //}, function () {
        //    try {
        //        notificacao.confirm("Mensagem enviada com sucesso. Voltar para menu?", onConfirm, "Sucesso", "ok,cancelar");
        //    } catch (x) {
        //        alert("mensagem enviada com sucesso");
        //        $.ui.loadContent("#menuSest", false, false, "fade");
        //    }
        //}, this);
    });
}

function onConfirm(button) {
    //alert('You selected button ' + button);
    //console.log(button);
    if (button == 1) {
        //$.ui.loadContent("#destaque", false, false, "fade");
        $.ui.loadContent("#menuSest", false, false, "fade");
    }
}

function SelecionaUnidade() {
    $("a[href='#unidades']").bind("click", function () {
        if (!$("#unidades:visible").length) {
            LimparDados("#unidades");
            $("#qntUnidade").empty();
            $("#listaUnidade").empty();
        }
    });

    $("#slUF").change(function () {
        var uf = $("#slUF").val();
        var url = (window.cordova ? urlExterno : urlLocalhost) + "/api/unidade/PesquisarPorUf";
        listaUnidade(url, uf, function () {
            var boxHeight = ($("#unidades").height() - $("#filtroUnidade").height()) - 35;/* - 285;*/
            $("#boxLista").height(boxHeight);

            /*Bind evento de unidade*/
            BindUnidade();
        },
        function () {
            notificacao.alert("Ocorreu um erro", function () {
                notificacao.beep(2);
                notificacao.vibrate(200);
            }, "Erro", "OK");
        });
    });
}

function listaUnidade(url, uf, callbackSucesso, callbackErro) {
    try {
        inicioLoading("Buscando Unidades");
    } catch (e) {
        alert("erro: " + e);
    }
    $.ajax({
        type: "GET",
        url: url,
        data: { 'UF': uf },
        dataType: "json",
        crossDomain: true,
        success: function (data) {
            fimLoading();
            try {
                $("#qntUnidade").html("<p>Unidades encontradas: " + data.length + "</p>");
                $("#listaUnidade").html(
                    "<ul>" +
                jQuery.map(data, function (unidade, i) {
                    //if (url.contains(urlExterno, true))
                    //    unidade.NomeAbreviado = unidade.Nome;
                    return "<li class='btUnidade' data-id=" + unidade.Id + " > <span class='unidade-tipologia'>" +
                    unidade.Tipologia + "</span> <span class='unidade-descricao'>" +
                    (unidade.NomeAbreviado.length > 30 ? unidade.NomeAbreviado.slice(0, 30) + "..." : unidade.NomeAbreviado) +
                    "</span><span class='unidade-seta icon-arrow-right icon-2x'></span></li>";
                }).join("") + "</ul>");
                callbackSucesso();
            }
            catch (e) {
                alert("erro map:" + e);
            }
        },
        error: function (data) {
            fimLoading();
            callbackErro();
        }
    });
}

function BindUnidade() {
    $("li.btUnidade").bind("click", function () {
        $(".tabServicos li:first").click();
        var id = $(arguments[0].currentTarget).attr("data-id");
        var url = (window.cordova ? urlExterno : urlLocalhost) + "/api/unidade/Recuperar";
        $.ajax({
            type: "GET",
            url: url,
            data: { 'id': id },
            dataType: "json",
            crossDomain: true,
            success: function (data) {
                data.imagem = "http://www.sestsenat.org.br/PublishingImages/Unidades/" + id + ".jpg";
                $("#containerTmpl").html($("#unidadeTmpl").html());
                $("#containerUnidade").loadTemplate("#containerTmpl", data, {
                    overwriteCache: true
                });
                try {
                    carregaMapa(data.Latitude, data.Longitude);
                    carregaServicos(id);
                } catch (e) {
                    alert("erro ao carregar mapa: " + e);
                }
                $.ui.loadContent("#box-unidade", false, false, "slide");
                //if (url.contains(urlExterno, true))
                //    unidade.NomeAbreviado = unidade.Nome;
                $.ui.setTitle(data.Tipologia + " - " + data.NomeAbreviado);
            },
            error: function (data) {
                fimLoading();
            }
        });
    });

}

function carregaServicos(idUnidade) {
    $("#servicoSaude").empty();
    $("#servicoCursos").empty();
    $("#servicoLazer").empty();
    $("#servicoOdontologia").empty();
    ServicoCurso(idUnidade);
    ServicoEsporte(idUnidade);
    ServicoOdontologia(idUnidade);
    ServicoSaude(idUnidade);
    $(".conteudoServico").scroller();
}

function ServicoCurso(unidade) {
    var url = (window.cordova ? urlExterno : urlLocalhost) + "/api/servicoUnidade/cursos";
    $.ajax({
        type: "GET",
        url: url,
        data: { 'idunidade': unidade },
        dataType: "json",
        crossDomain: true,
        success: function (data) {
            var resultado = "<ul>";
            if (data.length > 0) {
                resultado += jQuery.map(data, function (val, i) {
                    return "<li data-id='" + val.Id + "'>" + val.Nome + "</li>";
                }).join("");
            } else {
                resultado += "<li>Unidade não está oferecendo cursos no momento</li>"
            }
            resultado += "</ul>";

            $("#servicoCursos").html(resultado);
        },
        error: function (data) {
            fimLoading();
        }
    });
}
function ServicoSaude(unidade) {
    var url = (window.cordova ? urlExterno : urlLocalhost) + "/api/servicoUnidade/medico";
    $.ajax({
        type: "GET",
        url: url,
        data: { 'idunidade': unidade },
        dataType: "json",
        crossDomain: true,
        success: function (data) {
            var resultado = "<ul>";
            if (data.length > 0) {
                resultado += jQuery.map(data, function (val, i) {
                    return "<li>" + val.Nome + "</li>";
                }).join("");
            } else {
                resultado += "<li>Unidade não presta serviço Médico</li>"
            }
            resultado += "</ul>";

            $("#servicoSaude").html(resultado);
        },
        error: function (data) {
            // fimLoading();
        }
    });
}
function ServicoEsporte(unidade) {
    var url = (window.cordova ? urlExterno : urlLocalhost) + "/api/servicoUnidade/esporte";
    $.ajax({
        type: "GET",
        url: url,
        data: { 'idunidade': unidade },
        dataType: "json",
        crossDomain: true,
        success: function (data) {
            var resultado = "<ul>";
            if (data.length > 0) {
                resultado += jQuery.map(data, function (val, i) {
                    return "<li>" + val.Nome + "</li>";
                }).join("");
            } else {
                resultado += "<li>Unidade não presta serviço de Esporte e Lazer</li>"
            }
            resultado += "</ul>";

            $("#servicoLazer").html(resultado);
        },
        error: function (data) {
            // fimLoading();
        }
    });
}
function ServicoOdontologia(unidade) {
    var url = (window.cordova ? urlExterno : urlLocalhost) + "/api/servicoUnidade/odontologia";
    $.ajax({
        type: "GET",
        url: url,
        data: { 'idunidade': unidade },
        dataType: "json",
        crossDomain: true,
        success: function (data) {
            var resultado = "<ul>";
            if (data.length > 0) {
                resultado += jQuery.map(data, function (val, i) {
                    return "<li>" + val.Nome + "</li>";
                }).join("");
            } else {
                resultado += "<li>Unidade não presta serviço de Odontologia</li>"
            }
            resultado += "</ul>";

            $("#servicoOdontologia").html(resultado);
        },
        error: function (data) {
            //fimLoading();
        }
    });
}

function Login() {
    $("#btnLogin").click(function (e) {
        e.preventDefault();

        var login = $("#txLogin").val();
        var senha = $("#txSenha").val();
        if (login == "sest" && senha == "sest")
            $.ui.loadContent("#menuSest", false, false, "fade");
        else
            alert("login e senha inválidos");
    });
}

function LimparDados(seletor) {
    $(seletor + " input").val("");
    $(seletor + " textarea").val("");
    /*$("#unidades select>option").removeProp("selected");*/
    $(seletor + " select>option:first").prop("selected", true);
}



