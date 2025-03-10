document.addEventListener('alpine:init', () => {
    Alpine.data('activityManager', () => ({
        selectedActivity: null,
        isEditing: false,
        parentActivity: null,
        projectData: null,
        activityData: {
            name: '',
            type: '',
            interventionLevel: 'National',
            frequency: 'Once',
            startDate: '',
            endDate: '',
            objectives: '',
            responsibilities: [],
            mainIndicator: {
                name: '',
                baseline: 0,
                mtrTarget: 0,
                endTarget: 0,
                comments: ''
            },
            subIndicators: []
        },
        availableChildTypes: {
            'Component': ['Outcome'],
            'Outcome': ['Output'],
            'Output': ['Activity'],
            'Activity': ['Activity']
        },
        modal: null,

        init() {
            // Get project data from the data attribute
            const projectElement = document.getElementById('project-data');
            if (projectElement) {
                this.projectData = JSON.parse(projectElement.dataset.project);
            }
            this.modal = new bootstrap.Modal(document.getElementById('activityModal'));
        },

        // showAddActivity(parentActivity = null) {
        //     this.isEditing = false;
        //     this.parentActivity = parentActivity;

        //     const startDate = parentActivity ? parentActivity.startDate : this.projectData.startingDate;
        //     const endDate = parentActivity ? parentActivity.endDate : this.projectData.endingDate;

        //     this.activityData = {
        //         name: '',
        //         type: parentActivity ? this.availableChildTypes[parentActivity.type][0] : 'Component',
        //         interventionLevel: 'National',
        //         frequency: 'Once',
        //         startDate: this.formatDateForInput(startDate),
        //         endDate: this.formatDateForInput(endDate),
        //         objectives: '',
        //         responsibilities: [],
        //         mainIndicator: {
        //             name: '',
        //             baseline: 0,
        //             mtrTarget: 0,
        //             endTarget: 0,
        //             comments: ''
        //         },
        //         subIndicators: []
        //     };

        //     this.modal.show();
        // },

        showAddActivity(parentActivity = null) {
            this.isEditing = false;
            this.parentActivity = parentActivity;
        
            // Reset activity data with correct type based on parent
            this.activityData = {
                name: '',
                // For top-level activities (no parent), only allow Component
                // For child activities, use the first available child type based on parent type
                type: parentActivity ? 
                    this.availableChildTypes[parentActivity.type][0] : 
                    'Component',
                interventionLevel: 'National',
                frequency: 'Once',
                startDate: parentActivity ? 
                    this.formatDateForInput(parentActivity.startDate) : 
                    this.formatDateForInput(this.projectData.startingDate),
                endDate: parentActivity ? 
                    this.formatDateForInput(parentActivity.endDate) : 
                    this.formatDateForInput(this.projectData.endingDate),
                objectives: '',
                responsibilities: [],
                mainIndicator: {
                    name: '',
                    baseline: 0,
                    mtrTarget: 0,
                    endTarget: 0,
                    comments: ''
                },
                subIndicators: []
            };
        
            this.modal.show();
        },
        showEditActivity(activity) {
            this.isEditing = true;
            this.selectedActivity = activity;
            this.parentActivity = activity.parentActivityId ?
                this.projectData.activities.find(a => a.id === activity.parentActivityId) : null;

            this.activityData = {
                id: activity.id,
                name: activity.name,
                type: activity.type,
                interventionLevel: activity.interventionLevel,
                frequency: activity.frequency || 'Once',
                startDate: this.formatDateForInput(activity.startDate),
                endDate: this.formatDateForInput(activity.endDate),
                objectives: activity.objectives || '',
                responsibilities: activity.responsibilities || [],
                parentActivityId: activity.parentActivityId,
                mainIndicator: activity.mainIndicator ? {
                    id: activity.mainIndicator.id,
                    name: activity.mainIndicator.name,
                    baseline: activity.mainIndicator.baseline,
                    mtrTarget: activity.mainIndicator.mtrTarget,
                    endTarget: activity.mainIndicator.endTarget,
                    comments: activity.mainIndicator.comments
                } : {
                    name: '',
                    baseline: 0,
                    mtrTarget: 0,
                    endTarget: 0,
                    comments: ''
                },
                subIndicators: activity.subIndicators?.map(si => ({
                    id: si.id,
                    name: si.name,
                    category: si.category,
                    baseline: si.baseline,
                    mtrTarget: si.mtrTarget,
                    endTarget: si.endTarget,
                    comments: si.comments
                })) || []
            };

            this.modal.show();
        },
        addSubIndicator() {
            this.activityData.subIndicators.push({
                name: '',
                category: 'All',
                baseline: 0,
                mtrTarget: 0,
                endTarget: 0,
                comments: ''
            });
        },
        removeSubIndicator(index) {
            this.activityData.subIndicators.splice(index, 1);
        },
        validateIndicators() {
            const { mainIndicator, subIndicators } = this.activityData;

            // Validate main indicator
            if (mainIndicator.name && (
                isNaN(mainIndicator.baseline) ||
                isNaN(mainIndicator.mtrTarget) ||
                isNaN(mainIndicator.endTarget) ||
                mainIndicator.mtrTarget < mainIndicator.baseline ||
                mainIndicator.endTarget < mainIndicator.mtrTarget
            )) {
                throw new Error('Invalid main indicator values. Please ensure targets are greater than baseline.');
            }

            // Validate sub indicators
            subIndicators.forEach((indicator, index) => {
                if (
                    !indicator.name ||
                    isNaN(indicator.baseline) ||
                    isNaN(indicator.mtrTarget) ||
                    isNaN(indicator.endTarget) ||
                    indicator.mtrTarget < indicator.baseline ||
                    indicator.endTarget < indicator.mtrTarget
                ) {
                    throw new Error(`Invalid values in sub indicator #${index + 1}`);
                }
            });
        },
        addResponsibility() {
            this.activityData.responsibilities.push({
                name: '',
                role: '',
                institution: '',
                responsibilities: ''
            });
        },

        removeResponsibility(index) {
            this.activityData.responsibilities.splice(index, 1);
        },

        async saveActivity() {
            try {
                if (!this.projectData?.id) {
                    throw new Error('Project ID not found');
                }

                // Validate indicators
                this.validateIndicators();

                const url = this.isEditing ?
                    `/admin/projects/${this.projectData.id}/activities/${this.activityData.id}` :
                    `/admin/projects/${this.projectData.id}/activities`;

                const method = this.isEditing ? 'PUT' : 'POST';

                // Prepare data, including indicators
                const data = {
                    ...this.activityData,
                    parentActivityId: this.parentActivity?.id,
                    // Only include mainIndicator if it has a name
                    mainIndicator: this.activityData.mainIndicator?.name ? this.activityData.mainIndicator : null,
                    // Only include subIndicators if array has items
                    subIndicators: this.activityData.subIndicators?.length > 0 ? this.activityData.subIndicators : null
                };

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to save activity');
                }

                // Show success message
                this.showNotification('Activity saved successfully', 'success');

                this.modal.hide();
                window.location.reload();
            } catch (error) {
                console.error('Error:', error);
                this.showNotification(error.message, 'error');
            }
        },
        showNotification(message, type = 'info') {
            alert(message);
        },
        validateDates() {
            const start = new Date(this.activityData.startDate);
            const end = new Date(this.activityData.endDate);

            if (start >= end) {
                throw new Error('Start date must be before end date');
            }

            const projectStart = new Date(this.projectData.startingDate);
            const projectEnd = new Date(this.projectData.endingDate);

            if (start < projectStart || end > projectEnd) {
                throw new Error('Activity dates must be within project timeline');
            }

            if (this.parentActivity) {
                const parentStart = new Date(this.parentActivity.startDate);
                const parentEnd = new Date(this.parentActivity.endDate);

                if (start < parentStart || end > parentEnd) {
                    throw new Error('Activity dates must be within parent activity timeline');
                }
            }
        },

        async deleteActivity(activityId) {
            if (!confirm('Are you sure you want to delete this activity?')) {
                return;
            }

            try {
                const response = await fetch(
                    `/admin/projects/${this.projectData.id}/activities/${activityId}`,
                    { method: 'DELETE' }
                );

                if (!response.ok) {
                    throw new Error('Failed to delete activity. Reset its logframe first');
                }

                window.location.reload();
            } catch (error) {
                console.error('Error:', error);
                alert(error.message);
            }
        },

        // Helper methods
        formatDateForInput(dateString) {
            return dateString ? dateString.split('T')[0] : '';
        },

        getTypeBadgeClass(type) {
            return {
                'Component': 'bg-primary',
                'Outcome': 'bg-success',
                'Output': 'bg-info',
                'Activity': 'bg-secondary'
            }[type] || 'bg-secondary';
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        },

        // Date validation methods
        getValidDateRange() {
            if (this.parentActivity) {
                return {
                    min: this.formatDateForInput(this.parentActivity.startDate),
                    max: this.formatDateForInput(this.parentActivity.endDate)
                };
            }
            return {
                min: this.formatDateForInput(this.projectData.startingDate),
                max: this.formatDateForInput(this.projectData.endingDate)
            };
        },

        canAddSubActivity(activityType) {
            return this.availableChildTypes[activityType]?.length > 0;
        },

        //viewing the activity details
        calculateDuration() {
            if (!this.selectedActivity) return 0;
            const start = new Date(this.selectedActivity.startDate);
            const end = new Date(this.selectedActivity.endDate);
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        },

        calculateStatus() {
            if (!this.selectedActivity) return '';
            const now = new Date();
            const start = new Date(this.selectedActivity.startDate);
            const end = new Date(this.selectedActivity.endDate);

            if (now < start) return 'Not Started';
            if (now > end) return 'Completed';
            return 'In Progress';
        },

        getStatusBadgeClass() {
            const status = this.calculateStatus();
            return {
                'Not Started': 'bg-warning',
                'In Progress': 'bg-primary',
                'Completed': 'bg-success'
            }[status] || 'bg-secondary';
        },

        calculateProgress() {
            if (!this.selectedActivity?.mainIndicator) return 0;
            const { baseline, mtrTarget, endTarget } = this.selectedActivity.mainIndicator;
            return Math.round(((mtrTarget - baseline) / (endTarget - baseline)) * 100);
        },

        exportActivityDetails() {
            if (!this.selectedActivity) return;

            const data = {
                ...this.selectedActivity,
                duration: this.calculateDuration() + ' days',
                status: this.calculateStatus(),
                progress: this.calculateProgress() + '%'
            };

            // Create and download JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity-${this.selectedActivity.id}-details.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        },

        viewActivity(activity) {
            this.selectedActivity = activity;
            new bootstrap.Modal(document.getElementById('viewActivityModal')).show();
        },

        //more export options
        exportToPDF() {
            const { jsPDF } = window.jspdf;
            const activity = this.selectedActivity;

            // Create PDF in portrait mode with point unit
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            // Define styles
            const titleSize = 18;
            const sectionSize = 14;
            const textSize = 11;
            const lineHeight = 25;
            let yPos = 40;
            const margin = 40;
            const pageWidth = doc.internal.pageSize.width - (margin * 2);

            // Helper function for text wrapping
            const addWrappedText = (text, y, size = textSize, indent = 0) => {
                doc.setFontSize(size);
                const lines = doc.splitTextToSize(text, pageWidth - indent);
                lines.forEach(line => {
                    doc.text(line, margin + indent, y);
                    y += lineHeight;
                });
                return y;
            };

            // Helper function for section headers
            const addSectionHeader = (text, y) => {
                doc.setFontSize(sectionSize);
                doc.setFont(undefined, 'bold');
                doc.text(text, margin, y);
                doc.setFont(undefined, 'normal');
                return y + lineHeight;
            };

            // Add title
            doc.setFontSize(titleSize);
            doc.setFont(undefined, 'bold');
            doc.text('Activity Details Report', margin, yPos);
            doc.setFont(undefined, 'normal');
            yPos += lineHeight * 2;

            // Basic Information Section
            yPos = addSectionHeader('Basic Information', yPos);
            doc.setFontSize(textSize);

            const basicInfo = [
                [`Name: ${activity.name}`],
                [`Type: ${activity.type}`],
                [`Level: ${activity.interventionLevel}`],
                [`Duration: ${this.calculateDuration()} days`],
                [`Status: ${this.calculateStatus()}`],
                [`Start Date: ${this.formatDate(activity.startDate)}`],
                [`End Date: ${this.formatDate(activity.endDate)}`],
            ];

            basicInfo.forEach(info => {
                doc.text(info, margin, yPos);
                yPos += lineHeight;
            });
            yPos += lineHeight;

            // Objectives Section
            if (activity.objectives) {
                yPos = addSectionHeader('Objectives', yPos);
                yPos = addWrappedText(activity.objectives, yPos);
                yPos += lineHeight;
            }

            // Main Indicator Section
            if (activity.mainIndicator) {
                yPos = addSectionHeader('Main Indicator', yPos);
                const mainInd = activity.mainIndicator;
                yPos = addWrappedText(`Name: ${mainInd.name}`, yPos);
                yPos = addWrappedText(`Progress: ${this.calculateProgress()}%`, yPos);

                const indicators = [
                    `Baseline: ${mainInd.baseline}`,
                    `MTR Target: ${mainInd.mtrTarget}`,
                    `End Target: ${mainInd.endTarget}`
                ];
                indicators.forEach(ind => {
                    yPos = addWrappedText(ind, yPos);
                });

                if (mainInd.comments) {
                    yPos += lineHeight / 2;
                    yPos = addWrappedText(`Comments: ${mainInd.comments}`, yPos);
                }
                yPos += lineHeight;
            }

            // Sub Indicators Section
            if (activity.subIndicators?.length) {
                yPos = addSectionHeader('Sub Indicators', yPos);

                activity.subIndicators.forEach((si, index) => {
                    // Check if we need a new page
                    if (yPos > doc.internal.pageSize.height - 100) {
                        doc.addPage();
                        yPos = 40;
                    }

                    yPos = addWrappedText(`${index + 1}. ${si.name}`, yPos);
                    yPos = addWrappedText(`Category: ${si.category}`, yPos, textSize, 20);
                    yPos = addWrappedText(`Baseline: ${si.baseline}`, yPos, textSize, 20);
                    yPos = addWrappedText(`MTR Target: ${si.mtrTarget}`, yPos, textSize, 20);
                    yPos = addWrappedText(`End Target: ${si.endTarget}`, yPos, textSize, 20);
                    if (si.comments) {
                        yPos = addWrappedText(`Comments: ${si.comments}`, yPos, textSize, 20);
                    }
                    yPos += lineHeight / 2;
                });
                yPos += lineHeight;
            }

            // Responsibilities Section
            if (activity.responsibilities?.length) {
                // Check if we need a new page
                if (yPos > doc.internal.pageSize.height - 200) {
                    doc.addPage();
                    yPos = 40;
                }

                yPos = addSectionHeader('Responsibilities', yPos);

                activity.responsibilities.forEach((resp, index) => {
                    yPos = addWrappedText(`${index + 1}. ${resp.name}`, yPos);
                    yPos = addWrappedText(`Role: ${resp.role}`, yPos, textSize, 20);
                    yPos = addWrappedText(`Institution: ${resp.institution}`, yPos, textSize, 20);
                    yPos = addWrappedText(`Responsibilities: ${resp.responsibilities}`, yPos, textSize, 20);
                    yPos += lineHeight / 2;
                });
            }

            // Add footer with date and page numbers
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.height - 20);
                doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.width - margin - 60, doc.internal.pageSize.height - 20);
            }

            // Save the PDF
            doc.save(`activity-${activity.id}-details.pdf`);
        },

        exportToWord() {
            const activity = this.selectedActivity;

            // Create HTML content
            const htmlContent = `
                <html>
                <body>
                    <h1 style="color: #2c3e50;">Activity Details</h1>
                    
                    <h2>Basic Information</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${activity.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Type:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${activity.type}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Level:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${activity.interventionLevel}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Duration:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${this.calculateDuration()} days</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${this.calculateStatus()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Start Date:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${this.formatDate(activity.startDate)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>End Date:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${this.formatDate(activity.endDate)}</td>
                        </tr>
                    </table>
        
                    ${activity.objectives ? `
                        <h2>Objectives</h2>
                        <p>${activity.objectives}</p>
                    ` : ''}
        
                    ${activity.mainIndicator ? `
                        <h2>Main Indicator</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${activity.mainIndicator.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Progress:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.calculateProgress()}%</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Baseline:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${activity.mainIndicator.baseline}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>MTR Target:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${activity.mainIndicator.mtrTarget}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>End Target:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${activity.mainIndicator.endTarget}</td>
                            </tr>
                        </table>
                    ` : ''}
        
                    ${activity.responsibilities?.length ? `
                        <h2>Responsibilities</h2>
                        ${activity.responsibilities.map(resp => `
                            <div style="margin-bottom: 20px;">
                                <h3>${resp.name}</h3>
                                <p><strong>Role:</strong> ${resp.role}</p>
                                <p><strong>Institution:</strong> ${resp.institution}</p>
                                <p><strong>Responsibilities:</strong> ${resp.responsibilities}</p>
                            </div>
                        `).join('')}
                    ` : ''}
                </body>
                </html>
            `;

            // Convert to Blob
            const blob = new Blob([htmlContent], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `activity-${activity.id}-details.doc`;
            link.click();
            URL.revokeObjectURL(url);
        },

        exportToExcel() {
            const activity = this.selectedActivity;

            // Prepare data for Excel
            const data = [
                ['Activity Details'],
                ['Name', activity.name],
                ['Type', activity.type],
                ['Level', activity.interventionLevel],
                ['Duration', `${this.calculateDuration()} days`],
                ['Status', this.calculateStatus()],
                ['Start Date', this.formatDate(activity.startDate)],
                ['End Date', this.formatDate(activity.endDate)],
                ['Objectives', activity.objectives || ''],
                [],
                ['Main Indicator'],
                ['Name', activity.mainIndicator?.name || ''],
                ['Baseline', activity.mainIndicator?.baseline || ''],
                ['MTR Target', activity.mainIndicator?.mtrTarget || ''],
                ['End Target', activity.mainIndicator?.endTarget || ''],
                [],
                ['Sub Indicators'],
                ['Name', 'Category', 'Baseline', 'MTR Target', 'End Target']
            ];

            // Add sub indicators
            if (activity.subIndicators?.length) {
                activity.subIndicators.forEach(si => {
                    data.push([si.name, si.category, si.baseline, si.mtrTarget, si.endTarget]);
                });
            }

            // Add responsibilities
            data.push(
                [],
                ['Responsibilities'],
                ['Name', 'Role', 'Institution', 'Responsibilities']
            );
            if (activity.responsibilities?.length) {
                activity.responsibilities.forEach(resp => {
                    data.push([resp.name, resp.role, resp.institution, resp.responsibilities]);
                });
            }

            // Create workbook
            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Activity Details');

            // Save file
            XLSX.writeFile(wb, `activity-${activity.id}-details.xlsx`);
        },

        //all activities export
        exportAllToExcel() {
            window.location.href = `/admin/projects/${this.projectData.id}/planning/activities/export`;
        },

        exportAllToPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            // Helper functions for PDF generation
            const margin = 40;
            const pageWidth = doc.internal.pageSize.width - (margin * 2);
            let yPos = 40;

            const addWrappedText = (text, y, size = 11, indent = 0) => {
                doc.setFontSize(size);
                const lines = doc.splitTextToSize(text, pageWidth - indent);
                lines.forEach(line => {
                    if (y > doc.internal.pageSize.height - 50) {
                        doc.addPage();
                        y = 40;
                    }
                    doc.text(line, margin + indent, y);
                    y += 25;
                });
                return y;
            };

            const addSectionHeader = (text, y) => {
                if (y > doc.internal.pageSize.height - 50) {
                    doc.addPage();
                    y = 40;
                }
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(text, margin, y);
                doc.setFont(undefined, 'normal');
                return y + 25;
            };

            // Add title
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('Project Activities Report', margin, yPos);
            doc.setFont(undefined, 'normal');
            yPos += 40;

            // Add project info
            yPos = addSectionHeader('Project Information', yPos);
            yPos = addWrappedText(`Project: ${this.projectData.title}`, yPos);
            yPos = addWrappedText(`Duration: ${this.formatDate(this.projectData.startingDate)} - ${this.formatDate(this.projectData.endingDate)}`, yPos);
            yPos += 20;

            // Process each activity
            const activities = this.projectData.activities || [];
            activities.forEach((activity, index) => {
                yPos = addSectionHeader(`Activity ${index + 1}: ${activity.name}`, yPos);

                // Basic Info
                const basicInfo = [
                    `Type: ${activity.type}`,
                    `Level: ${activity.interventionLevel}`,
                    `Duration: ${this.calculateActivityDuration(activity)} days`,
                    `Status: ${this.calculateActivityStatus(activity)}`,
                    `Start Date: ${this.formatDate(activity.startDate)}`,
                    `End Date: ${this.formatDate(activity.endDate)}`
                ];

                basicInfo.forEach(info => {
                    yPos = addWrappedText(info, yPos);
                });

                // Objectives
                if (activity.objectives) {
                    yPos += 10;
                    yPos = addWrappedText('Objectives:', yPos);
                    yPos = addWrappedText(activity.objectives, yPos, 11, 20);
                }

                // Main Indicator
                if (activity.mainIndicator) {
                    yPos += 10;
                    yPos = addWrappedText('Main Indicator:', yPos);
                    yPos = addWrappedText(`Name: ${activity.mainIndicator.name}`, yPos, 11, 20);
                    yPos = addWrappedText(`Progress: ${this.calculateActivityProgress(activity)}%`, yPos, 11, 20);
                    yPos = addWrappedText(`Baseline: ${activity.mainIndicator.baseline}`, yPos, 11, 20);
                    yPos = addWrappedText(`MTR Target: ${activity.mainIndicator.mtrTarget}`, yPos, 11, 20);
                    yPos = addWrappedText(`End Target: ${activity.mainIndicator.endTarget}`, yPos, 11, 20);
                }

                // Responsibilities
                if (activity.responsibilities?.length) {
                    yPos += 10;
                    yPos = addWrappedText('Responsibilities:', yPos);
                    activity.responsibilities.forEach(resp => {
                        yPos = addWrappedText(`${resp.name} (${resp.role})`, yPos, 11, 20);
                        yPos = addWrappedText(`Institution: ${resp.institution}`, yPos, 11, 40);
                        yPos = addWrappedText(`Tasks: ${resp.responsibilities}`, yPos, 11, 40);
                    });
                }

                yPos += 30; // Add space between activities
            });

            // Add footer with date and page numbers
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.height - 20);
                doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.width - margin - 60, doc.internal.pageSize.height - 20);
            }

            doc.save(`project-activities-report.pdf`);
        },


        exportAllToWord() {
            const activities = this.projectData.activities || [];

            let htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .header { text-align: center; margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; }
                        th { background-color: #f5f5f5; }
                        .section { margin-bottom: 30px; }
                        .activity { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
                        .responsibility { margin-left: 20px; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Project Activities Report</h1>
                        <p>Project: ${this.projectData.title}</p>
                        <p>Duration: ${this.formatDate(this.projectData.startingDate)} - ${this.formatDate(this.projectData.endingDate)}</p>
                    </div>
            `;

            activities.forEach((activity, index) => {
                htmlContent += `
                    <div class="activity">
                        <h2>Activity ${index + 1}: ${activity.name}</h2>
                        <table>
                            <tr>
                                <th>Type</th>
                                <td>${activity.type}</td>
                                <th>Level</th>
                                <td>${activity.interventionLevel}</td>
                            </tr>
                            <tr>
                                <th>Start Date</th>
                                <td>${this.formatDate(activity.startDate)}</td>
                                <th>End Date</th>
                                <td>${this.formatDate(activity.endDate)}</td>
                            </tr>
                            <tr>
                                <th>Duration</th>
                                <td>${this.calculateActivityDuration(activity)} days</td>
                                <th>Status</th>
                                <td>${this.calculateActivityStatus(activity)}</td>
                            </tr>
                        </table>
        
                        ${activity.objectives ? `
                            <div class="section">
                                <h3>Objectives</h3>
                                <p>${activity.objectives}</p>
                            </div>
                        ` : ''}
        
                        ${activity.mainIndicator ? `
                            <div class="section">
                                <h3>Main Indicator</h3>
                                <table>
                                    <tr>
                                        <th>Name</th>
                                        <td colspan="3">${activity.mainIndicator.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Baseline</th>
                                        <td>${activity.mainIndicator.baseline}</td>
                                        <th>Progress</th>
                                        <td>${this.calculateActivityProgress(activity)}%</td>
                                    </tr>
                                    <tr>
                                        <th>MTR Target</th>
                                        <td>${activity.mainIndicator.mtrTarget}</td>
                                        <th>End Target</th>
                                        <td>${activity.mainIndicator.endTarget}</td>
                                    </tr>
                                </table>
                            </div>
                        ` : ''}
        
                        ${activity.responsibilities?.length ? `
                            <div class="section">
                                <h3>Responsibilities</h3>
                                ${activity.responsibilities.map(resp => `
                                    <div class="responsibility">
                                        <h4>${resp.name} (${resp.role})</h4>
                                        <p><strong>Institution:</strong> ${resp.institution}</p>
                                        <p><strong>Tasks:</strong> ${resp.responsibilities}</p>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            htmlContent += `
                    <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                        Generated on ${new Date().toLocaleDateString()}
                    </div>
                </body>
                </html>
            `;

            // Create download
            const blob = new Blob([htmlContent], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'project-activities-report.doc';
            link.click();
            URL.revokeObjectURL(url);
        },
        calculateActivityDuration(activity) {
            const start = new Date(activity.startDate);
            const end = new Date(activity.endDate);
            return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        },

        calculateActivityStatus(activity) {
            const now = new Date();
            const start = new Date(activity.startDate);
            const end = new Date(activity.endDate);

            if (now < start) return 'Not Started';
            if (now > end) return 'Completed';
            return 'In Progress';
        },

        calculateActivityProgress(activity) {
            if (!activity.mainIndicator) return 0;
            const { baseline, mtrTarget, endTarget } = activity.mainIndicator;
            return Math.round(((mtrTarget - baseline) / (endTarget - baseline)) * 100);
        },
    }));
});