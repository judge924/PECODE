/**
 * 국회의원 검색 관련 스크립트 파일이다.
 * 
 * @author JHKIM
 * @version 1.0 2019/10/16
 */
////////////////////////////////////////////////////////////////////////////////
// GLOBAL VARIABLE
////////////////////////////////////////////////////////////////////////////////
var GC_TMPL = {
	list: {
		item : 
			"<tr>" +
			"	<td class=\"m_none rownum\"></td>" +
			"	<td class=\"m_none unitNm\"></td>" +
			"	<td class=\"m_left\"><a href=\"javascript:;\" class=\"hgNm\" title=\"새창열림\"></a></td>" +
			"	<td class=\"polyNm\"></td>" +
			"	<td class=\"m_none cmits\"></td>" +
			"	<td class=\"m_none origNm\"></td>" +
			"	<td class=\"m_none sexGbnNm\"></td>" +
			"	<td class=\"m_none reeleGbnNm\"></td>" +
			"	<td class=\"m_none eleGbnNm\"></td>" +
			"</tr>"
	},
	pic: {
		item : 
			"<li>" +
			"	<a href=\"javascript:;\" class=\"nassem_reslut_pic\" title=\"새창열림\">" +
			"		<div><img src=\"\"></div>" +
			"		<span class=\"\"></span>" +
			"	</a>" +
			"</li>"
	}
};

////////////////////////////////////////////////////////////////////////////////
// SCRIPT INIT
////////////////////////////////////////////////////////////////////////////////
$(function() {

	// 이벤트를 바인딩한다.
	bindEvent();
	
	// 데이터를 조회한다.
	loadData();
});


/**
 * 데이터를 조회한다.
 */
function loadData() {
	
	// 목록 리스트
	searchAssmMembList(1);
	
	// 사진보기 리스트
	searchAssmMembPic(1);
}

/**
 * 목록 리스트 페이징 조회
 * @param page	페이지번호
 */
function searchAssmMembList(page) {
	page = page || 1;
	doSearch({
		url : "/portal/assm/search/searchAssmMemberSch.do",
		page : page,
		before : beforeSearchAssmMembList,
		after : afterSearchAssmMembList,
		pager : "list-sect-pager",
		counter: {
			total: "searchResultCnt"
		}
	});
}

/**
 * 목록 리스트 페이징 조회 전처리
 */
function beforeSearchAssmMembList(options) {
	var form = $("#schform");
	var listform = $("#listform");
	
	if (com.wise.util.isEmpty(options.page)) {
		listform.find("[name=page]").val("1");
	} 
	else {
		listform.find("[name=page]").val(options.page);
	}
	
	var data = form.serializeObject();
	data["rows"] = listform.find("[name=rows]").val();
	data["page"] = listform.find("[name=page]").val();
	
	return data;
}

/**
 * 목록 리스트 페이징 조회 후처리
 */
function afterSearchAssmMembList(datas) {
	var item = "",
	data = null,
	list = $("#list-result-sect");
	
	list.empty();
	
	if ( datas.length > 0 ) {
		
		for ( var i in datas ) {
			data = datas[i];
			
			item = $(GC_TMPL.list.item);
			
			item.find(".rownum").text(data.ROW_NUM);
			/*item.find(".hgNm").text(data.hgNm)
				.bind("click", {openNaId: data.openNaId }, function(event) {
					//gfn_openMembPopup(event.data.monaCd);

					gfn_openNowMembPopup(event.data.openNaId);
					return false;
				});*/
			item.find(".hgNm").text(data.hgNm)
				.bind("click", {linkUrl: data.linkUrl }, function(event) {
					//gfn_openMembPopup(event.data.monaCd);

					gfn_newNowMembPopup(event.data.linkUrl);
					return false;
				});
			item.find(".polyNm").text(data.polyNm);
			item.find(".cmits").text(data.cmits);
			item.find(".origNm").text(data.origNm);
			item.find(".sexGbnNm").text(data.sexGbnNm);
			item.find(".reeleGbnNm").text(data.reeleGbnNm);
			item.find(".eleGbnNm").text(data.eleGbnNm);
			item.find(".unitNm").text(data.unitNm);
			
			list.append(item);
		}
	}
	else { 
		item = $(GC_TMPL.list.item);
		list.append("<tr><td colspan=\""+ (item.find("td").length) +"\">조회된 데이터가 없습니다.</td></tr>");
	}
	
	// 검색결과 숫자표시
	viewResultCnt(datas);
	
	hideMobileDetailSearchView();	// 모바일 상세조회 닫기
}

/**
 * 사진보기 리스트 페이징 조회
 * @param page	페이지번호
 */
function searchAssmMembPic(page) {
	page = page || 1;
	doSearch({
		url : "/portal/assm/search/searchAssmMemberSch.do",
		page : page,
		before : beforeSearchAssmMembPic,
		after : afterSearchAssmMembPic,
		pager : "pic-sect-pager",
		counter: {
			total: "searchResultCnt"
		}
	});
}

/**
 * 사진보기 리스트 페이징 조회 전처리
 * @param options
 * @returns
 */
function beforeSearchAssmMembPic(options) {
	var form = $("#schform");
	var picform = $("#picform");
	
	if (com.wise.util.isEmpty(options.page)) {
		picform.find("[name=page]").val("1");
	} 
	else {
		picform.find("[name=page]").val(options.page);
	}
	
	var data = form.serializeObject();
	data["rows"] = picform.find("[name=rows]").val();
	data["page"] = picform.find("[name=page]").val();
	
	return data;
}

/**
 * 사진보기 리스트 페이징 조회 후처리
 * @param datas
 * @returns
 */
function afterSearchAssmMembPic(datas) {
	var item = "",
		data = null,
		list = $("#pic-result-sect"),
		ul = $(".nassem_result_ul");

	ul.empty();
	
	if ( datas.length > 0 ) {
		for ( var i=0; i < datas.length; i++ ) {
			data = datas[i];
			
			item = $(GC_TMPL.pic.item);

			item.find("img").attr("src", data.deptImgUrl)
				.bind("click", {linkUrl: data.linkUrl }, function(event) {
					//gfn_openMembPopup(event.data.monaCd);
					gfn_newNowMembPopup(event.data.linkUrl);
					return false;
				});
			
			//웹접근성 조치 20.11.09
			item.find("img").closest("a").bind("keydown", {linkUrl: data.linkUrl}, function(event) {
				if (event.which == 13) {
					//gfn_openMembPopup(event.data.monaCd);
					gfn_newNowMembPopup(event.data.linkUrl);
					return false;
				}
			});
			
			item.find("span").text(data.hgNm).addClass("politics" + data.polyCd);
			item.find("span").prepend("<i>"+data.polyNm+"</i>");
			item.find("img").attr("alt", data.hgNm + " 국회의원 사진");  
			ul.append(item);
		}
	}
	
	hideMobileDetailSearchView();	// 모바일 상세조회 닫기
	
	// 검색결과 숫자표시
	//viewResultCnt(datas);
}

/**
 * 검색결과 숫자표시
 */
function viewResultCnt(datas) {
	
	if ( datas != null ) {
		var totalCnt = Number($("#schform #allCnt").val());
		var searchResultCnt = Number($("#searchResultCnt").text());
		var calcCnt = (searchResultCnt / totalCnt * 100).toFixed(1);
		$("#result-cnt-sect").find("span").text("조회하신 국회의원의 전체 국회의원 비중은 " + String(calcCnt) + "% 입니다.");
		
		// 검색결과 차트 로드
		loadSearchChart(calcCnt);
	}
}

// 모바일 상세조회 레이어창 닫기
function hideMobileDetailSearchView() {
	if ( $(".theme_select_box").hasClass("on") ) {
		$(".theme_select_box").removeClass("on");
	}
}

/**
 * 이벤트를 바인딩한다.
 * @returns
 */
function bindEvent() {
	var formObj = $("#schform");
	var formObj2 = $("#listform");
	// 탭 이벤트(목록/사진보기)
	$("#tab-btn-sect a").each(function(idx) {
		$(this).bind("click", function() {
			//웹접근성 조치 23.11.06
			$("#tab-btn-sect a").removeClass("on").removeAttr("title");
			$(this).toggleClass("on").attr("title","선택됨");
			if ( idx == 0 )  {
				$(".nassem_result_list").show();
				$(".nassem_result_picture").hide();
			}
			else if ( idx == 1 ) {
				$(".nassem_result_list").hide();
				$(".nassem_result_picture").show();
			}
		});
	});
	
	// 검색
	$("#btnSearch").bind("click", function() {
		searchAssmMembList(1);
		searchAssmMembPic(1);
	});
	
	// 모바일 검색
	$("#btnMbSearch").bind("click", function() {
		var searchVal = $("input[id=schMbHgNm]").val();
		$("#btnInit").click();
		$("input[name=schHgNm]").val(searchVal);
		searchAssmMembList(1);
		searchAssmMembPic(1);
	});
	
	$("input[name=schHgNm]").bind("keydown", function(event) {
		if ( event.which == 13 ) {
			$("#btnSearch").click();
		}
	});
	
	// 모바일 이름 검색
	$("input[id=schMbHgNm]").bind("keydown", function(event) {
		if ( event.which == 13 ) {
			$("#btnMbSearch").click();
		}
	});
	
	// 모바일 상세조회 레이어창 열기
	$("#btnMbDtlSearch").bind("click", function(event) {
		$(".theme_select_box").addClass("on");
	});
	// 모바일 상세조회 레이어창 닫기
	$("#btnMbCateClose").bind("click", function(event) {
		hideMobileDetailSearchView()
	});
	
	// 초기화
	$("#btnInit").bind("click", function() {
		var schform = $("#schform");
		schform.find("input[name=schHgNm], input[name=schMbHgNm], select").val("");
	});
	
	// 차트보기(임시)
	$("#chartViewA").bind("click", function() {
		var url = com.wise.help.url("/portal/assm/chart/memberSchChartPopPage.do");
		OpenWindow(url, "chartPop", "1024", "850", "yes");
	});
	
	//지역 선택 시 해당 선거구 콤보박스 조회
	$("#schUpOrig").bind("change", function() {
		var formObj = $("#schform");
		var upDtlNo = $(this).val();
		
		loadTabComboOptions(formObj, "schOrig", "/portal/assm/search/searchAssmMembCommCd.do", {listNo: 204, upDtlNo: upDtlNo}, "", true);
	});
	
	// 엑셀 다운로드
	formObj2.find("#btnDownload").bind("click", function() {
	    gfn_fileDownload({
	    	url: "/portal/assm/downExcel.do",
	    	params: formObj.serialize()
	    });
	});
}

/**
 * 검색 차트 로드
 * @param data	결과값(문자)
 * @returns
 */
function loadSearchChart(data) {
	var chart = Highcharts.chart('chartSearchResult', {
 		colors: ["#4e9dd3", "#E6E6E6"],
 		credits: {
 			enabled: false
 		},
	    title: {
	    	text: '',
	    	style: {
		        fontSize: '30px',
		        fontWeight: 'bold',
		        fontColor: '#FFFFFF'
		    },
		    verticalAlign: 'middle'
	    },
	    chart: {
	        plotBackgroundColor: null,
	        plotBorderWidth: null,
	        plotShadow: false,
	        type: 'pie'
	    },
	    plotOptions: {
	        pie: {
	        	dataLabels: {
	            	enabled: true,
	            	distance: -30,
	            	style: {
	            		fontSize: '12px',
	            		color: '#000000',
	            		fontFamily: 'notoKrM',
	            		textOutline: 0
	            	}
	            },	
	            allowPointSelect: true,
	            size: '80%'
	        }
	    },
	    tooltip: {
	      enabled: false
	    },
	    series: [{
	        name: '국회의원',
	        data: [
	                [data+'%', Number(data)],
	                [_.toString(_.round(100-Number(data), 1)) + '%', (_.round(100-Number(data), 1))]
	            ]
	    }]
	    
	});
	/*
	chart.setTitle({
        text: chart.series[0].data[0].y + '%'
    });*/
}

/**
 * 국회의원 통계보기 팝업에서 넘어왔을경우
 * @param name	정당명
 * @returns
 */
function goMemberSchPage(name){
	$("#schPoly :contains('"+ com.wise.help.XSSfilter(name) +"')").attr("selected", "selected")
	
	searchAssmMembList(1);
}