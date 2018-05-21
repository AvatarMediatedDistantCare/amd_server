var VitalGraph = function (target_id, title, num_data) {
    var data = [];

    var chart = new Highcharts.Chart({
        chart: {
            renderTo: target_id,
            height: 200,
            animation: false
        },
        title: {
            text: title
        },
        xAxis: {
            title: {
                enabled: false
            },
            labels: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                enabled: false
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            minRange: 600
        },
        tooltip: {
            valueSuffix: ''
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'value',
            data: []
        }]
    });

    this.add_data = function (added) {
        data.push(added);

        var num_overflow = data.length - num_data;
        // console.log(num_overflow);

        if (num_overflow > 0) {
            data.splice(0, num_overflow);
        }

        // chart.series[0].setData(data);
    };

    setInterval(function () {
        chart.series[0].setData(data);
    }, 100);
};