var styleFeedbackMap = new Map()
var clicksFunnel = []
var clickElementFeedback = []

$(document).ready(function() {

  setTimeout(function(){ console.log(clicksFunnel) }, 3000);
  setInterval(console.log(clicksFunnel), 1000);
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

   function generateScreenshot(selector) {
    return html2canvas(document.querySelector(selector), {
            logging: true,
            profile: true,
            useCORS: true,
            async: true
        }).then(function(canvas) {
        var data = canvas.toDataURL('image/jpeg', 0.9);
        return encodeURI(data);
    });
  }

  function stopChangingColor() {
     var path = $(this).first().getPath()
     var style = styleFeedbackMap.get(path)
     document.querySelector(path).style = style
     highlightClicked = true
   }

   function stopBtn(e) {
     e.preventDefault()
     $('body > .feedback-tooltip:has(.feedback-tooltip-window)').remove()
     var path = $(this).first().getPath()
     highlightClicked = true
     $(this).off('click.disabled');
     $(this).unbind('click', clickFeedbackHandler);
     $(this).unbind('click', stopBtn);
    }

  function submitBtn(e) {

     e.stopPropagation()
     var feedbackRate = $('[class="smile checked"]').prop('value')
     var feedbackText = $('div.feedback-tooltip textarea').val()

     var selector = $(this).first().getPath()
     var elem = clickElementFeedback.find( x => x.selector === selector.replace(/html>body>div:nth-child\(\d\)/g ,'#canvas'))
     let data = {
       selector,
       page,
       domain,
       dataUri: elem.dataUri,
       userId: '1',
       feedbackRate,
       feedbackText
      }

     $.ajax({
         url: `${endPoint}/submitFeeddback/`,
         method: 'POST',
         contentType: 'application/x-www-form-urlencoded',
         headers: {
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Headers': 'Authorization, Content-Type'
         },
         data,
         success: function(data) {
           $('#feedback-form').hide();
           $('#feedback-success_message').show();
           console.log('feedback submitted');
         },
         error: function(request,msg,error) {
         //  alert(error)
         }
     });

     highlightClicked = true
     // $(this).off('click.disabled');
     $('.header-img').prop('src', 'images/checkmark-48.png')
     $(this).unbind('click', clickFeedbackHandler);
     $(this).unbind('click', stopBtn);
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
        },
        popupFeedbackIcon: function (divToPop) {
            var pos=$(this).offset();
            var h=$(this).height();
            var w=$(this).width();
            var windowWidht = screen.width;
            var windowHeight = screen.height;

            var top = pos.top + ( h * 0.3)
            var left = (pos.left === 0) ? w : pos.left + w
            $(divToPop).css({ left , top });
        },
        popupFeedbackForm: function (divToPop) {
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
        }
     });

   ['click'].forEach(function (name) {
     var eventElements = ['LI','A','BUTTON']
     var target = null;
     window.addEventListener(name, function (ev) {
       // ev.preventDefault()
       if ($('.feedback-tooltip').find(ev.target).length === 0) {
       if (eventElements.includes(ev.target.parentElement.nodeName)) {
         target = ev.target.parentElement
       }
       else {
         target = ev.target.offsetParent
       }
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

       clicksFunnel.push(path)
       let data
       let uri = `${endPoint}/update/`
       var dataUri =  generateScreenshot(path).then(dataUri => {
         data =  {
           domain,
           userId: 1,
           eventType: name,
           selector: path,
           elementInfo,
           page,
           dataUri
          }

          console.log(data);
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
          // let aTag = $(target).attr("href")
          // if (aTag)  window.location = aTag
          // $(ev.target).trigger(name);
       })

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
          if ($(elem.selector).length === 0 || page.match(elem.page) === null) continue
          var highlightClicked = false
          var path = $(elem.selector).first().getPath()
          var selectorStyle = document.querySelector(path).style
             $(elem.selector).each(function( index ) {
               // $(elem.selector).parents().css('backgroundColor', 'transparent')
               var path = $(this).first().getPath()
               var tooltipDiv = document.createElement('div')
               tooltipDiv.setAttribute('class', 'feedback-icon')
               tooltipDiv.setAttribute('id',  `feedback-icon${counter}`)
               tooltipDiv.innerHTML = `
                 <div class="feedback-tooltip-icon">
                 <div class="item">
                   <div class="item-inner">
                     <a class="egg"></a>
                   </div>
                 </div>
                    <!--img width="74px" height="30px" src='images/rotating-question-mark-gif-39.gif' /-->
                    <!--img width="150px" height="50px" src='images/feedback-icon-7-01.png' /-->
                 </div>
               `
              $('body').append(tooltipDiv)
               $(this).popupFeedbackIcon(tooltipDiv);
               $(tooltipDiv).find('.egg').bind('click', { form: elem.feedbackForm, elemenToAdd: this, elementToDelete: `feedback-icon${counter}` }, clickFeedbackHandler)
             });
             counter++
         }

    }

    function clickFeedbackHandler(e) {
       e.stopPropagation()
       document.getElementById(e.data.elementToDelete).remove()
       var tooltipDiv = document.createElement('div')
       tooltipDiv.setAttribute('class', 'feedback-tooltip')

       tooltipDiv.innerHTML = retriveFormFeedback(e.data.form)
       $('body').append(tooltipDiv)
       $(e.data.elemenToAdd).popupFeedbackForm('body > .feedback-tooltip');
       $(e.data.elemenToAdd).on('click.disabled', false);
       $('.smile').bind( 'change', smileSelection.bind(e.data.elemenToAdd))
       $('.close').bind('click', stopBtn.bind(e.data.elemenToAdd))
       $('[id*="-submit"]').bind('click', submitBtn.bind(e.data.elemenToAdd))
       $(this).unbind('click' , clickFeedbackHandler)
       highlightClicked = true
       e.preventDefault()
     }

   function smileSelection(e){
      $('.smile').prop("class", "smile")
      $(e.target).prop("class", $(e.target).prop("class") + " checked");
   }

   function getElementsForFeedbacks() {
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
           clickElementFeedback = result
           highlightFeedback(result)
         },
         error: function(request,msg,error) {
        }
      });
    }
   getElementsForFeedbacks()
});
