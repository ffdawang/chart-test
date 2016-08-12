// Date.prototype.addHours = function(h) {
//     this.setTime(this.getTime() + (h*60*60*1000));
//     return this;
// };

// Date.prototype.fmtTime = function() {
//     mon = this.getMonth()+1 >= 10 ? this.getMonth()+1 : '0' + (this.getMonth()+1);
//     da = this.getDate() >= 10 ? this.getDate() : '0' + this.getDate();
//     hr = this.getHours() >= 10 ? this.getHours() : '0' + this.getHours();
//     mi = this.getMinutes() >= 10 ? this.getMinutes() : '0' + this.getMinutes();
//     se = this.getSeconds() >= 10 ? this.getSeconds() : '0' + this.getSeconds();
//     return (1900+this.getYear()) + '/' + mon + '/' + da + ' ' + 
//         hr + ':' + mi + ':' + se ;
// }

var node = {
    create:function() {
        return {
            time:0,
            weight:0,
            volume:0,
            jsonurl:null,
            imgUpdate:0,
            evtCode:0,
            next:null
        };
    },
    merge:function(nd, ar) {
        bs = ar[0].trim().split('/');
        bs = bs[bs.length-1]
        timestr = bs.substr(4,4) + '/' + bs.substr(8,2) + '/' + bs.substr(10,2) + ' ' + bs.substr(12,2) + ':' + bs.substr(14,2) + ':' + bs.substr(16,2);
        var tt = new Date(timestr);
        //var tt = Number(bs.substr(4, 14));
        if( !nd ) {
            nd = this.create();
            nd.time = tt;
            nd.weight = Number(ar[1]);
            nd.volume = Number(ar[3]);
            nd.jsonurl = ar[0];
            nd.imgUpdate = Number(ar[5].substr(0, ar[5].length-2));
            nd.evtCode = Number(ar[6]);
        } else {
            // cross hour boundary or not?
            //var newhour = parseInt(tt/10000);
            //var hour = parseInt(nd.time/10000);
            while( nd.time < tt  && tt.getHours() != nd.time.getHours() ) {
                snd = this.create();
                snd.time = new Date(nd.time.getYear()+1900, nd.time.getMonth(), nd.time.getDate(),
                    nd.time.getHours()+1, 0, 0);
                snd.weight = nd.weight;
                snd.volume = nd.volume;
                snd.jsonurl = nd.jsonurl;
                snd.imgUpdate = nd.imgUpdate;
                snd.evtCode = nd.evtCode;
                nd.next = snd;
                nd = snd;
            }
            if( nd.time > tt ) throw 'You give me rubbish data?';
            if( nd.imgUpdate != Number(ar[5].substr(0,ar[5].length-2)) ||
                nd.weight != Number(ar[1]) || nd.weight != Number(ar[3]) ) {
                // info changed
                snd = this.create();
                snd.time = tt;
                snd.weight = Number(ar[1]);
                snd.volume = Number(ar[3]);
                snd.jsonurl = ar[0];
                snd.imgUpdate = Number(ar[5].substr(0, ar[5].length-2));
                snd.evtCode = Number(ar[6]);
                nd.next = snd;
                nd = snd;
            }
        }
        return nd;
    }
};

var DataList = {
    create:function() {
        var instance = {
            name:'data list',
            head:null,
            tail:null,
            load:function(data){
                var lines = data.trim().split('\n');
                var nd = null;
                for( i in lines ) {
                    ss = lines[i].trim().split(',');
                    if( ss.length ) {
                        nd = node.merge(nd, ss)
                        if( this.head == null ) this.head = nd;
                    } 
                }
                this.tail = nd;
            },
            clear:function(){},
            prepareData:function(span) {
                var data = [];
                if( !this.head ) {
                    return data;
                }
                if( span == '1day') {} 
                else if( span == '10day') {}
                else if( span == '3hour') {
                    var nd = this.head;
                    while( nd != null ) {
                        data.push([nd.time, nd.weight, nd.volume, nd.evtCode]);
                        //data += nd.time.fmtTime();
                        //data += ',' + nd.weight;
                        //data += ',' + nd.volume + '\n';
                        nd = nd.next;
                    }
                }
                return data;
            }
        };
        return instance;
    }
}