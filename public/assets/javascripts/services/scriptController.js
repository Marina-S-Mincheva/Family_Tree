$(document).ready(function() {
    $('#options').hover(function() {
        $(this).toggleClass('option1 option2');
        console.log(this);
    });
    $('#options2').hover(function() {
        $(this).toggleClass('option3 option4');
    });
    $('#options3').hover(function() {
        $(this).toggleClass('option5 option6');
    });
});



// LOGIN_REGISTER ERRORS

function errorClear(element, elementError) {
    $(element).click(function(event) {
        $(elementError).html("<p></p><br>");
        $(element).css('border-color', 'white');
    });
};

errorClear('#firstName', '#firstNameError');
errorClear('#secondName', '#secondNameError');
errorClear('#email', '#emailError');
errorClear('#password', '#passwordError');
errorClear('#emailLogin', '#emailErrorLogin');
errorClear('#passwordLogin', '#passwordErrorLogin');

$(window).on('hashchange', function() {
    if (window.location.hash !== "#/dashboard" || window.location.hash !== "") {
        if (isDialogOpen) {
            // $("#ftMemberForm").dialog("close");
            $(".ui-dialog-content").dialog("close");
            isDialogOpen = false;
        }
    }
});

function createNewMemberForm() {
    $("#ftMemberForm").dialog({ width: 482, show: { effect: "fold", duration: 900 } });
    isDialogOpen = true;
}

function backToMyTree() {
    $("#found-family-tree").css("display", "none");
    $("#ft-family-tree").css("display", "inline-block");
    if (isFamilyEmpty) {
        $("#startForm").css("display", "inline-block");
        $("#printTree").css("display", "none");
    } else {
        $("#saveTree").css("display", "inline-block");
        $("#deleteTree").css("display", "inline-block");
        $("#printTree").css("display", "inline-block");
    }
    $("#backToMyTree").css("display", "none");
}


// var slectedTree = [];
var neededArray = [];
foundFamilyToRender = undefined;
var callFuncNum = 0;

function getTree() {
    $("#startForm").css("display", "none");
    $("#saveTree").css("display", "none");
    $("#deleteTree").css("display", "none");
    $("#backToMyTree").css("display", "inline-block");
    $("#printTree").css("display", "inline-block");

    $("#found-family-tree").css("display", "block");
    $("#ft-family-tree").css("display", "none");
    $("#found-family-tree").html('');
    neededArray = [];
    callFuncNum = 0;
    $(".foundPeople li").click(function() {
        var index = $(".foundPeople li").index(this);
        var array = this.innerText.split('*')
        var arrayHashKey = array[1];
        arrayHashKey = arrayHashKey.trim();
        for (var array = 0; array < allTrees.length; array++) {
            if (allTrees[array].$$hashKey === arrayHashKey) {
                var arrayInSearch = allTrees[array];
                break;
            }
        }
        neededArray = arrayInSearch.slice();
        console.log("render this! ", neededArray);
        callFuncNum++;
        // slectedTree = neededArray;
        // renderFoundTree(neededArray);
        if (callFuncNum === 1) {
            foundFamilyToRender = $('#found-family-tree').found_family_render({
                referenceVar: 'foundFamilyToRender'
            });
        }

    });
}

(function($) {
    $.fn.found_family_render = function(options) {
        var familyObj = new foundFamily(options);
        familyObj.rootDiv = this;
        if (familyObj.rootDiv === null) {
            jQuery.error('wrong id given');
            return;
        }
        familyObj.init();
        return familyObj;
    }
    var foundFamily = function(options) {
        this.rootDiv = '';
        this.treeGroundFound = null;
        this.family = neededArray.slice();
        this.options_menu = null;
        this.referenceVar = '';
        this.selectedMember = null;
        this.memberFormID = 'FoundMemberForm';
        this.oldestMemberId = 0;
        this.addBreadingGround();
        if (options.referenceVar) {
            this.referenceVar = options.referenceVar;
        }
        return this;
    }
    foundFamily.prototype = {
        constructor: foundFamily,
        init: function() {
            this.createOptionsMenu();
            this.addBreadingGround();
            this.createNewMemberForm();
            // ******************************
            this.refreshFamily();
            neededArray = [];
            // ************************
        },
        refreshFamily: function() {
            console.log("family BEFORE DB ", this.family);
            this.oldestMemberId = this.getOldestMemberId(0);
            console.log(this.oldestMemberId);
            var html = "<ul>" + this.renderFamily(this.family[this.oldestMemberId]) + "</ul>";
            $(this.treeGroundFound).html(html);
        },
        getOldestMemberId: function(memberIndex) {
            var parentId = undefined;
            if (this.family[memberIndex].father) {
                parentId = this.family[memberIndex].father;
            } else if (this.family[memberIndex].mother) {
                parentId = this.family[memberIndex].mother;
            }
            if (parentId !== undefined) {
                if (this.family[parentId].child && this.family[parentId].child.length > 0) {
                    return this.getOldestMemberId(parentId);
                }
            }
            return this.family[memberIndex].id;
        },
        createOptionsMenu: function() {
            var div = $('<div>').attr('id', 'ft-popmenu');
            var ul = $('<ul>');
            var root = this;
            // view member button
            var liDisplay = $('<li>').html('View Profile').appendTo(ul);
            liDisplay.click(function(event) {
                root.openMemberForm(false);
                $(root.options_menu).css('display', 'none');
            });
            // cancel the pop menu
            var liCancel = $('<li>').html('Cancel').appendTo(ul);
            liCancel.click(function(event) {
                $(root.options_menu).hide();
            });
            $(div).append(ul);
            this.options_menu = div;
            $(this.options_menu).appendTo(this.rootDiv);
        },
        openMemberForm: function(isNewMember) {
            if (!isNewMember) {
                $('#ft-isediting-found').val(1);
                $('#profilePic-found').prepend('<img id="profPic" src="' + this.selectedMember.pic + '" />');
                $('#ft-name-found').text(this.selectedMember.name);
                var gender = 'Male';
                if (this.selectedMember.gender === 'F') {
                    gender = 'Female';
                }
                $('#ft-gender-found').text(gender);
                $('#ft-age-found').text(this.selectedMember.age);
                $('#fbProfile-found').attr('href', this.selectedMember.fbProfile);
                $('#fbProfile-found').text(this.selectedMember.fbProfile);
                $('#ft-relation-found').parent().parent().hide();
            } else {
                $('#ft-isediting-found').val(0);
                $('#ft-relation-found').parent().parent().show();
            }
            $("#" + this.memberFormID).dialog({ width: 482, show: { effect: "fold", duration: 900 } });
            isDialogOpen = true;
        },
        addBreadingGround: function() {
            var member = $('<div>').attr('id', 'treeGroundFound');
            $(member).attr('class', 'tree-ground');
            $(member).appendTo(this.rootDiv);
            this.treeGroundFound = member;
            $(this.treeGroundFound).draggable();
        },
        renderFamily: function(member) {
            if (member.length <= 0) {
                return;
            }
            html = "<li>";
            html = html + this.getMemberHTML(member, false);
            if (member.spouse) {
                html = html + this.getMemberHTML(this.family[member.spouse], true);
            }
            if (member.child) {
                html = html + '<ul>';
                for (var index = 0; index < member.child.length; index++) {
                    html = html + this.renderFamily(this.family[member.child[index]]);
                }
                html = html + '</ul>';
            }
            html = html + "</li>";
            return html;
        },
        getMemberHTML: function(member, isSpouse) {
            var classHTML = "";
            if (isSpouse) {
                classHTML = ' class="single-member spouse" ';
            } else {
                classHTML = ' class="single-member" ';
            }
            var html = '<a href="javascript:void(0)" data-id="' + member.id + '" data-name="' + member.name + '" data-gender="' + member.gender + '" data-age="' + member.age + '" data-relation="" ' + classHTML + ' onclick="' + this.referenceVar + '.openMenu(this,event)"><span class="fa fa-close" onclick="' + this.referenceVar + '.removeMember(this)"></span><center><img id="member-picture-found' + member.id + '" src="' + member.pic + '"><br><span>' + member.name.slice(0, 5) + ' (' + member.gender.slice(0, 1) + ')</span></center></a>';
            return html;
        },
        readImage: function(input, memberId) {
            var files = $(input).prop('files');
            var root = this;
            if (files && files[0]) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    root.family[memberId].pic = e.target.result;
                    $('#member-picture-found' + memberId).attr('src', e.target.result);
                }

                reader.readAsDataURL(files[0]);
            }
        },
        createNewMemberForm: function() {
            var html = '';
            html = '<div id="' + this.memberFormID + '" title="Family Member Detail"><p>';
            html = html + '<div id="profilePic-found"></div>';
            html = html + '<table>';
            html = html + '<tr><td><label>Name</label></td><td><p id="ft-name-found"> </p></td></tr>';
            html = html + '<tr><td><label>Gender</label></td><td><p id="ft-gender-found">Female</p></td></tr>';
            html = html + '<tr><td><label>Age</label></td><td><p id="ft-age-found"></p></td></tr>';
            html = html + '<tr><td class="relations"><label>Relation</label></td><td class="relations"><select id="ft-relation-found"><option value="mother">First Member</option><option value="child">Child</option><option value="spouse">Spouse</option></select></td></tr>';
            html = html + '<tr><td><label>Facebook</label></td><td><p ><a id="fbProfile-found" target="_blank"></a></p></td></tr>';
            html = html + '<tr><td>&nbsp;</td><td><input type="hidden" value="0" id="ft-isediting-found"/><input id="closeButt" type="button" value="Close" onclick="' + this.referenceVar + '.closeProfile()"/></td></tr>';
            html = html + '</table>';
            html = html + '</p></div>';
            $(this.rootDiv).append(html);
            $("#FoundMemberForm").css("display", "none");
        },
        closeProfile: function() {
            $('#profilePic-found').children("img").remove();
            $(".ui-dialog-content").dialog("close");
            isDialogOpen = false;

        },
        openMenu: function(element, event) {
            this.selectedMember = this.family[$(element).attr('data-id')];
            $(this.options_menu).css('left', event.clientX);
            $(this.options_menu).css('top', event.clientY);
            $(this.options_menu).show();
        }
    }
}(jQuery));