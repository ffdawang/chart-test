var node = {
    create:function() {
        return {
            time:0,
            weight:0,
            volume:0,
            jsonurl:null,
            imgUpdate:0,
            next:null
        };
    },
    merge:function(nd, ar) {
        bs = ar[0].trim().split('/');
        bs = bs[bs.length-1]
        var tt = Number(bs.substr(4, 14));
        if( !nd ) {
            nd = this.create();
            nd.time = tt;
            nd.weight = Number(ar[1]);
            nd.volume = Number(ar[3]);
            nd.jsonurl = ar[0];
            nd.imgUpdate = Number(ar[5].substr(0, ar[5].length-2));
        } else {
            // cross hour boundary or not?
            var newhour = parseInt(tt/10000);
            var hour = parseInt(nd.time/10000);
            while( hour < newhour ) {
                snd = this.create();
                snd.time = hour*10000;
                snd.weight = nd.weight;
                snd.volume = nd.volume;
                snd.jsonurl = nd.jsonurl;
                nd.imgUpdate = nd.imgUpdate;
                nd.next = snd;
                nd = snd;
                hour++;
            }
            if( hour > newhour ) throw 'You give me rubbish data?';
            if( nd.imgUpdate != Number(ar[5].substr(0,ar[5].length-2)) ||
                nd.weight != Number(ar[1]) || nd.weight != Number(ar[3]) ) {
                // info changed
                snd = this.create();
                snd.time = tt;
                snd.weight = Number(ar[1]);
                snd.volume = Number(ar[3]);
                snd.jsonurl = ar[0];
                snd.imgUpdate = Number(ar[5].substr(0, ar[5].length-2));
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
                var data = '';
                if( !this.head ) {
                    return data;
                }
                if( span == '1day') {} 
                else if( span == '10day') {}
                else if( span == '3hour') {
                    var nd = this.head;
                    while( nd != null ) {
                        data += nd.time;
                        data += ',' + nd.weight;
                        data += ',' + nd.volume + '\n';
                        nd = nd.next;
                    }
                }
                return data;
            }
        };
        return instance;
    }
}