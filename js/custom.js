var styleFeedbackMap = new Map()

$(document).ready(function() {
  var domain = $(location).attr('host') || 'localhost'
  var page = window.location.pathname
  var endPoint = 'http://localhost:3000'

  $('body').prepend('<div class="cover"></div>')
  $('body').wrapInner( "<div id='canvas'></div>");

  function changeColor(e) {
     var path = $(this).first().getPath()
     var selectorStyle = document.querySelector(path).style
     styleFeedbackMap.set(path, selectorStyle);
      $(this).css( {
        background: '-webkit-gradient(linear, left top, left bottom, from(#e5a0b3), to(#e5a0b3))',
        'border-color': 'red'})
   }

  function stopChangingColor() {
     var path = $(this).first().getPath()
     var style = styleFeedbackMap.get(path)
     document.querySelector(path).style = style
     highlightClicked = true
   }

   function stopBtn(e) {
     $('body > .feedback-tooltip:has(.feedback-tooltip-window)').remove()
     var path = $(this).first().getPath()
     // var style = styleFeedbackMap.get(path)
     // document.querySelector(path).style = style
     highlightClicked = true
     // $(this).bind( "mouseover", changeColor);
     // $(this).bind( "mouseleave", stopChangingColor);
     $(this).off('click.disabled');
     $(this).unbind('click', clickFeedbackHandler);
    }

  function submitBtn(e) {

     e.stopPropagation()
     var feedbackRate = $('[class="smile checked"]').prop('value')
     var feedbackText = $('div.feedback-tooltip textarea').val()

     var selector = $(this).first().getPath()
      $.ajax({
        url: `${endPoint}/submitFeeddback`,
        type: "POST",
        dataType: 'json',
        data: {
          selector,
          page,
          domain,
          userId: '1',
          feedbackRate,
          feedbackText
         },
        ContentType: 'application/json',
        success: function(data) {
          $('#feedback-form').hide();
          $('#feedback-success_message').show();
          console.log('feedback submitted');
        },
        error: function(jqXHR) {
          console.log(jqXHR);
        }
   })

     highlightClicked = true
     // $(this).off('click.disabled');
     $('.header-img').prop('src', 'images/checkmark-48.png')
     $(this).unbind('click', clickFeedbackHandler);
     e.preventDefault()
   }

  function setMouseFollowerColorAndText(id){
     var message = 'Press escape to cancel'
     if (id === 'feature-feedback') {
       mouseFollower(message, '#26B85A')
    } else if (id === 'help' || id === 'generalHelp') {
       mouseFollower(message, '#D88E8E')
    }
  }

  function retriveFormFeedback(id) {
     if (id === 'default') {
       return retriveFeedBackForm()
    } else if (id === 'help') {
      return defaultHelp()
    } else {
        return retriveNewIdeaForm()
    }

    }

    function mouseFollower(text, color) {
      var tooltip = document.querySelectorAll('.mouse-follower-tooltip');
      document.addEventListener('mousemove', fn, false);
      var windowWidht = screen.width;
      var windowHeight = screen.height;

       function fn(e) {
          for (var i=tooltip.length; i--;) {
             tooltip[i].style.left =  ( (e.pageX + 270) > windowWidht  ) ? (e.pageX - 270) + 'px' : e.pageX + 'px';
             tooltip[i].style.top = e.pageY + 'px';
             tooltip[i].style.background = color // '#004DB3'
             tooltip[i].innerHTML = text // 'Mark the section you want to report'
           }
       }
    }

    $.fn.extend({
        getPath: function () {
            var path, node = this;
            while (node.length) {
                var realNode = node[0], name = realNode.localName;
                if (!name) break;
                name = name.toLowerCase();

                var parent = node.parent();

                var sameTagSiblings = parent.children(name);
                if (sameTagSiblings.length > 1) {
                    var allSiblings = parent.children();
                    var index = allSiblings.index(realNode) + 1;
                    if (index > 0) {
                        name += ':nth-child(' + index + ')';
                    }
                }

                path = name + (path ? '>' + path : '');
                node = parent;
            }

            return path;
        }
     });

     $.fn.popupDiv2 = function (divToPop) {
         var pos=$(this).offset();
         var h=$(this).height();
         var w=$(this).width();
         var windowWidht = screen.width;
         var windowHeight = screen.height;
         var left = ( pos.left + w + 200 > screen.width ) ? screen.width - 80 : pos.left + 215
         var top =   pos.top - 15


         $(divToPop).css({ left , top });

         $(this).click(function(e) {
             $(divToPop).css({ left , top });
             if ($(divToPop).css('display') !== 'none') {
                 $(divToPop).hide();
             }
             else {
                 $(divToPop).show();
             }
         });
     };

    $.fn.popupDiv = function (divToPop) {
        var pos=$(this).offset();
        var h=$(this).height();
        var w=$(this).width();
        var windowWidht = screen.width;
        var windowHeight = screen.height;

        var left = ( pos.left + w + 200 > screen.width ) ? screen.width - 400 : pos.left + 100
        var top =  pos.top + 50
        $(divToPop).css({ left , top });

        $(this).click(function(e) {
            $(divToPop).css({ left , top });
            if ($(divToPop).css('display') !== 'none') {
                $(divToPop).hide();
            }
            else {
                $(divToPop).show();
            }
        });
    };

   ['click'].forEach(function (name) {
     var eventElements = ['LI','A','BUTTON']
     var target = null;
     window.addEventListener(name, function (ev) {
       // console.log(ev);
       // console.log(ev);
       if ($('.feedback-tooltip').find(ev.target).length === 0) {
       // if (eventElements.includes(ev.target.nodeName)) {
       //   target = ev.target
       // } else
        if (eventElements.includes(ev.target.parentElement.nodeName)) {
         target = ev.target.parentElement
       }
       else {
         target = ev.target.offsetParent
       }
       // console.log(target);
       if (target && target.tagName) {
       var path = $(target).first().getPath()
       let elementInfo = {}
       $(target).each(function() {
         $.each(this.attributes, function() {
           if(this.specified) {
             elementInfo[this.name] = this.value;
           }
         });
       });
       let text = $(target).text().replace(/[\n\r]+|[\s]{2,}/g, ' ').trim()
       if (text && text.length > 0 &&  text.length < 100 ) elementInfo['text'] = text
       if (target.tagName) elementInfo['tagName'] = target.tagName


       let data =  {
         domain,
         userId: 1,
         eventType: name,
         selector: path,
         elementInfo,
         page
        }

        let success = function(result) {
           alert(result)
        }

        let uri = `${endPoint}/update/`

        $.ajax({
            url: uri,
            method: 'PUT',
            contentType: 'application/x-www-form-urlencoded',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Authorization, Content-Type'
            },
            data,
            error: function(request,msg,error) {
            //  alert(error)
            }
        });
        }
      }
      });
    });

    function highlightFeedback(tempArray){
      var currentCanvasElement = document.getElementById('canvas')
      var self = this
      var counter = 0
        for (var elem of tempArray) {
          elem.selector = elem.selector.replace(/html>body>div:nth-child\(\d\)/g ,'#canvas')
          //console.log(normSelector);
          if ($(elem.selector).length === 0 || page.match(elem.page) === null) continue
          var highlightClicked = false
          var path = $(elem.selector).first().getPath()
          var selectorStyle = document.querySelector(path).style
          // styleFeedbackMap.set(path, selectorStyle);
          //
          // var color = {
          //   border: '#90EE90',
          //   background: 'transparent'
          // }
           //$(elem.selector).css("cssText", `border-color: ${color.border} !important; border-style: solid;border-width: 2px`);
             $(elem.selector).each(function( index ) {
               // $(elem.selector).parents().css('backgroundColor', 'transparent')
               var path = $(this).first().getPath()
               var tooltipDiv = document.createElement('div')
               tooltipDiv.setAttribute('class', 'feedback-icon')
               tooltipDiv.setAttribute('id',  `feedback-icon${counter}`)
               tooltipDiv.innerHTML = `
                 <div class="feedback-tooltip-icon">
                    <!--img width="74px" height="30px" src='images/rotating-question-mark-gif-39.gif' /-->
                    <img width="150px" height="50px" src='images/feedback-icon-7-01.png' />
                 </div>
               `
               // $(this).prepend(tooltipDiv)
                $('body').prepend(tooltipDiv)
               //console.log(this)
               $(this).popupDiv2(tooltipDiv);

               console.log(this);
               $(tooltipDiv).bind('click', { form: elem.feedbackForm, elemenToAdd: this, elementToDelete: `feedback-icon${counter}` }, clickFeedbackHandler)
             });
             counter++
         }

    }

    function clickFeedbackHandler(e) {
      console.log(`#${e.data.elementToDelete}`);
       e.stopPropagation()
       document.getElementById(e.data.elementToDelete).remove()
       //$('body > .feedback-tooltip:has(.feedback-tooltip-window)').remove()
       // $(`#${e.data.elementToDelete}`).remove()
       // $('body').find('div.feedback-tooltip').remove()
       var tooltipDiv = document.createElement('div')
       tooltipDiv.setAttribute('class', 'feedback-tooltip')

       tooltipDiv.innerHTML = retriveFormFeedback(e.data.form)
       $('body').prepend(tooltipDiv)
       $(e.data.elemenToAdd).popupDiv('body > .feedback-tooltip');
       $(e.data.elemenToAdd).on('click.disabled', false);
       $('.smile').bind( 'change', smileSelection.bind(e.data.elemenToAdd))
       $('.close').bind('click', stopBtn.bind(e.data.elemenToAdd))
       $('[id*="-submit"]').bind('click', submitBtn.bind(e.data.elemenToAdd))
       highlightClicked = true
       e.preventDefault()
     }

   function smileSelection(e){
      $('.smile').prop("class", "smile")
      $(e.target).prop("class", $(e.target).prop("class") + " checked");
   }

   function getElementsForFeedbacks() {
      var page = window.location.pathname.replace('/', '').replace('.html', '')
      let uri = `${endPoint}/getFeedbackElement/${domain}?page=${page}`
       $.ajax({
         url: uri,
         method: 'GET',
         contentType: 'application/x-www-form-urlencoded',
         headers: {
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Headers': 'Authorization, Content-Type'
         },
         success: function(result) {
           console.log(result);
           highlightFeedback(result)
         },
         error: function(request,msg,error) {
        }
      });
    }
   getElementsForFeedbacks()
});
