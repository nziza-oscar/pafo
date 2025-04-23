document.addEventListener('alpine:init', () => {
    Alpine.data('logframe', () => ({
        project: JSON.parse('<%- JSON.stringify(project) %>'),
        years: [],
        progressData: {},

        init() {
            this.initializeYears();
            this.processProgressData();
            this.initializeCharts();
        },

        initializeYears() {
            const startYear = new Date(this.project.startingDate).getFullYear();
            const endYear = new Date(this.project.endingDate).getFullYear();
            this.years = Array.from(
                { length: endYear - startYear + 1 },
                (_, i) => startYear + i
            );
        },

        // Enhanced hierarchy building with WBS
        get hierarchicalActivities() {
            return this.buildHierarchy(this.project.activities);
        },

        buildHierarchy(activities, parentId = null, parentWbs = '') {
            const result = [];
            const items = activities.filter(a => a.parentActivityId === parentId);

            items.forEach((item, index) => {
                const wbs = parentWbs ?
                    `${parentWbs}.${index + 1}` :
                    `${index + 1}`;

                const level = parentWbs.split('.').length - 1;
                result.push({
                    ...item,
                    level,
                    wbs,
                    indent: level * 20
                });

                const children = this.buildHierarchy(
                    activities,
                    item.id,
                    wbs
                );
                result.push(...children);
            });

            return result;
        },

        processProgressData() {
            this.progressData = {};
            this.project.activities.forEach(activity => {
                this.progressData[activity.id] = {};
                activity.activityProgresses?.forEach(progress => {
                    this.progressData[activity.id][progress.year] = progress.value;
                });
            });
        },

        getProgressValue(activityId, year) {
            return this.progressData[activityId]?.[year] || '';
        },

        calculateProgressPercentage(activity) {
            if (!activity.mainIndicator) return 0;

            const baseline = activity.mainIndicator.baseline || 0;
            const endTarget = activity.mainIndicator.endTarget || baseline;

            // Calculate progress based on all years' data
            const values = this.years.map(year =>
                this.getProgressValue(activity.id, year)
            ).filter(val => val !== '');

            const currentValue = values.length ?
                Math.max(...values) : baseline;

            if (endTarget <= baseline) return 0;
            return ((currentValue - baseline) / (endTarget - baseline) * 100);
        },

        initializeCharts() {
            // Store chart configurations for reuse
            const chartConfigs = {
                overall: {
                    type: 'line',
                    data: {
                        labels: this.years,
                        datasets: [{
                            label: 'Target Progress',
                            borderColor: 'rgb(75, 192, 192)',
                            data: [],
                            fill: false
                        }, {
                            label: 'Actual Progress',
                            borderColor: 'rgb(54, 162, 235)',
                            data: [],
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                },
                type: {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Progress (%)',
                            data: [],
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.5)',
                                'rgba(75, 192, 192, 0.5)',
                                'rgba(255, 206, 86, 0.5)',
                                'rgba(153, 102, 255, 0.5)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                }
            };

            // Initialize the charts
            const overallCtx = document.getElementById('overallProgressChart')?.getContext('2d');
            const typeCtx = document.getElementById('typeProgressChart')?.getContext('2d');

            if (overallCtx) {
                const chartData = this.calculateChartData();
                chartConfigs.overall.data.datasets[0].data = this.years.map(year => ({
                    x: year,
                    y: chartData.target[year] || 0
                }));
                chartConfigs.overall.data.datasets[1].data = this.years.map(year => ({
                    x: year,
                    y: chartData.actual[year] || 0
                }));
                this.charts.overall = new Chart(overallCtx, chartConfigs.overall);
            }

            if (typeCtx) {
                const progressByType = this.calculateProgressByType();
                chartConfigs.type.data.labels = Object.keys(progressByType);
                chartConfigs.type.data.datasets[0].data = Object.values(progressByType);
                this.charts.type = new Chart(typeCtx, chartConfigs.type);
            }
        },

        async updateProgress(event, activityId, year) {
            const value = event.target.value;
            this.loading = true;

            try {
                const response = await fetch(
                    `/admin/projects/${this.project.id}/activities/${activityId}/progress`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            activityId,
                            year: parseInt(year),
                            value: parseFloat(value)
                        })
                    }
                );

                const result = await response.json();
                if (result.success) {
                    // Update local data
                    const activity = this.project.activities.find(a => a.id === activityId);
                    if (activity) {
                        if (!activity.activityProgresses) {
                            activity.activityProgresses = [];
                        }

                        const progressIndex = activity.activityProgresses.findIndex(
                            p => p.year === parseInt(year)
                        );

                        if (progressIndex >= 0) {
                            activity.activityProgresses[progressIndex].value = parseFloat(value);
                        } else {
                            activity.activityProgresses.push({
                                year: parseInt(year),
                                value: parseFloat(value)
                            });
                        }

                        // Clean destroy of existing charts
                        Object.values(this.charts).forEach(chart => {
                            if (chart) {
                                chart.destroy();
                            }
                        });

                        // Clear charts object
                        this.charts = {};

                        // Wait for next tick before reinitializing charts
                        setTimeout(() => {
                            this.initializeCharts();
                        }, 0);
                    }
                } else {
                    throw new Error(result.error || 'Failed to update progress');
                }
            } catch (error) {
                console.error('Error updating progress:', error);
                alert('Error updating progress: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        safeUpdateCharts() {
            if (!this.charts.overall || !this.charts.type) {
                // If charts don't exist, reinitialize them
                Object.values(this.charts).forEach(chart => {
                    if (chart && typeof chart.destroy === 'function') {
                        chart.destroy();
                    }
                });
                this.charts = {};
                this.initializeCharts();
                return;
            }

            // Update existing charts
            const chartData = this.calculateChartData();
            const progressByType = this.calculateProgressByType();

            // Update overall progress chart
            this.charts.overall.data.datasets[0].data = this.years.map(year => ({
                x: year,
                y: chartData.target[year] || 0
            }));
            this.charts.overall.data.datasets[1].data = this.years.map(year => ({
                x: year,
                y: chartData.actual[year] || 0
            }));
            this.charts.overall.update();

            // Update progress by type chart
            this.charts.type.data.labels = Object.keys(progressByType);
            this.charts.type.data.datasets[0].data = Object.values(progressByType);
            this.charts.type.update();
        },

        calculateOverallProgress() {
            return this.years.map(year => ({
                target: 100 * (year - this.years[0]) / (this.years.length - 1),
                actual: this.calculateAverageProgress(year)
            }));
        },

        calculateAverageProgress(year) {
            const activities = this.project.activities;
            if (!activities?.length) return 0;

            return activities.reduce((sum, activity) => {
                return sum + this.calculateActivityProgress(activity, year);
            }, 0) / activities.length;
        },

        calculateActivityProgress(activity, year) {
            if (!activity.mainIndicator) return 0;
            const baseline = activity.mainIndicator.baseline || 0;
            const endTarget = activity.mainIndicator.endTarget || baseline;
            const currentValue = this.getProgressValue(activity.id, year) || baseline;

            return endTarget > baseline ?
                ((currentValue - baseline) / (endTarget - baseline) * 100) : 0;
        },

        calculateProgressByType() {
            const types = ['Component', 'Outcome', 'Output', 'Activity'];
            const result = {};

            types.forEach(type => {
                const typeActivities = this.project.activities.filter(a => a.type === type);
                if (!typeActivities.length) {
                    result[type] = 0;
                    return;
                }

                result[type] = typeActivities.reduce((sum, activity) => {
                    return sum + this.calculateProgressPercentage(activity);
                }, 0) / typeActivities.length;
            });

            return result;
        }
    }));
});