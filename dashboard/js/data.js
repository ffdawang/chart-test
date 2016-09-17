Date.prototype.addHours = function(h) {
    return new Date(this.getTime() + (h*60*60*1000));
};

Date.prototype.addDays = function(d) {
    return new Date(this.getTime() + (d*60*60*1000*24));
}

Date.prototype.addMins = function(m) {
    return new Date(this.getTime() + (m*60*1000) );
}


Date.prototype.fmtTime = function() {
    mon = this.getMonth()+1 >= 10 ? this.getMonth()+1 : '0' + (this.getMonth()+1);
    da = this.getDate() >= 10 ? this.getDate() : '0' + this.getDate();
    hr = this.getHours() >= 10 ? this.getHours() : '0' + this.getHours();
    mi = this.getMinutes() >= 10 ? this.getMinutes() : '0' + this.getMinutes();
    se = this.getSeconds() >= 10 ? this.getSeconds() : '0' + this.getSeconds();
    return (1900+this.getYear()) + '/' + mon + '/' + da + ' ' + 
        hr + ':' + mi + ':' + se ;
}

Date.prototype.fmtTime2 = function() {
    hr = this.getHours() >= 10 ? this.getHours() : '0' + this.getHours();
    mi = this.getMinutes() >= 10 ? this.getMinutes() : '0' + this.getMinutes();
    return hr + ':' + mi;
}

var node = {
    create:function() {
        return {
            time:0,
            weight:0,
            volume:0,
            jsonurl:null,
            imgUpdate:0,
            evtCode:0,
            status:0,
            text:null,
            next:null
        };
    },
    merge:function(nd, ar) {
        bs = ar[0].trim().split('/');
        bs = bs[bs.length-1]
        timestr = bs.substr(4,4) + '/' + bs.substr(8,2) + '/' + bs.substr(10,2) + ' ' + bs.substr(12,2) + ':' + bs.substr(14,2) + ':' + bs.substr(16,2);
        var tt = new Date(timestr);
        if( !nd ) {
            nd = this.create();
            nd.time = tt;
            nd.weight = parseFloat(Number(ar[1]).toFixed(3));
            nd.volume = parseFloat(Number(ar[3]).toFixed(3));
            nd.jsonurl = ar[0];
            nd.imgUpdate = Number(ar[5].substr(0, ar[5].length-2));
            nd.evtCode = Number(ar[6]);
            nd.status - Number(ar[7]);
            nd.text = ar[8];
        } else {
            // cross hour boundary or not?
            while( nd.time < tt  && tt.getHours() != nd.time.getHours() ) {
                snd = this.create();
                snd.time = new Date(nd.time.getYear()+1900, nd.time.getMonth(), nd.time.getDate(),
                    nd.time.getHours()+1, 0, 0);
                snd.weight = nd.weight;
                snd.volume = nd.volume;
                snd.jsonurl = nd.jsonurl;
                snd.imgUpdate = nd.imgUpdate;
                snd.evtCode = nd.evtCode;
                snd.status = nd.status;
                snd.text = nd.text;
                nd.next = snd;
                nd = snd;
            }
            if( nd.time > tt ) throw 'You give me rubbish data?';
            if( nd.imgUpdate != Number(ar[5].substr(0,ar[5].length-2)) ||
                nd.weight != Number(ar[1]) || nd.weight != Number(ar[3]) ) {
                // info changed
                snd = this.create();
                snd.time = tt;
                snd.weight = parseFloat(Number(ar[1]).toFixed(3));
                snd.volume = parseFloat(Number(ar[3]).toFixed(3));
                //snd.weight = -Number(ar[1]);
                //snd.volume = Number(ar[3]);
                snd.jsonurl = ar[0];
                snd.imgUpdate = Number(ar[5].substr(0, ar[5].length-2));
                snd.evtCode = Number(ar[6]);
                snd.status = Number(ar[7]);
                snd.text = ar[8];
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
                var nd = this.tail;
                for( i in lines ) {
                    ss = lines[i].trim().split(',');
                    if( ss.length ) {
                        nd = node.merge(nd, ss)
                        if( this.head == null ) this.head = nd;
                    } 
                }
                this.tail = nd;
            },
            clear:function(){
                this.head = null;
                this.tail = null; 
            },
            prepareData:function(start, end) {
                var data = [];
                if( !this.head ) return data;
                var nd = this.head;
                var last = null;
                while( nd != null ) {
                    if( end != null && nd.time > end ) {
                        if( last != null ) 
                            data.push([end, last.weight, last.volume, last]);
                        break;
                    }
                    if( nd.time >= start ) {
                        if( nd.time != start && data.length == 0 && last != null ) 
                            data.push([start, last.weight, last.volume, null]);
                        data.push([nd.time, nd.weight, nd.volume, nd]);
                    }
                    last = nd;
                    nd = nd.next;
                }
                return data;
            },
            since: function(start) {
                if( !this.head ) return null;
                var nd = this.head;
                var last = null;
                while( nd != null ) {
                    if( nd.time == start ) return nd;
                    else if( nd.time > start ) {
                        if( last ) return last;
                        else return nd;
                    }
                    last = nd;
                    nd = nd.next;
                } 
                return null;
            },
            getUpdateTime: function() {
                if( this.tail != null ) return this.tail.time.fmtTime(); 
                return null;
            }
        };
        return instance;
    }
}