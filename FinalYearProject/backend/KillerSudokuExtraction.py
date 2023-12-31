import cv2
import numpy as np
from backend.SudokuExtraction import SudokuExtraction
from backend.NumberRecognition import NumberRecognition


class KillerSudokuExtraction:
    '''
    This class is responsible for the processing killer Sudoku images.
    '''

    def __init__(self, image):
        '''
        A constructor method for instantiating the class

        parameters:
        image - the image which will be processed
        '''
        self.image = image
        self.extraction = SudokuExtraction(image)
        self.digitRecognition = NumberRecognition()

    
    def convertToPuzzle(self):
        '''
        Converts the image of the puzzle into the grid and the cages.

        Returns the grid and the dictionary containing the cages.
        '''
        processedImage = self.extraction.convertAndCrop()
        edgePoints, image = self.extraction.getBorder(processedImage)
        self.image = image
        straightenedImage = self.straightenImage(edgePoints)
        cells, cageSums = self.cellExtraction(straightenedImage)
        cages = self.getPuzzle(cells, cageSums)
        self.cages = [cages[i:i+9] for i in range(0, len(cages), 9)]
        cages = self.constructCages()

        grid = [["-","-","-","-","-","-","-","-","-"],
                ["-","-","-","-","-","-","-","-","-"], 
                ["-","-","-","-","-","-","-","-","-"],
                ["-","-","-","-","-","-","-","-","-"],                
                ["-","-","-","-","-","-","-","-","-"],
                ["-","-","-","-","-","-","-","-","-"],                
                ["-","-","-","-","-","-","-","-","-"],
                ["-","-","-","-","-","-","-","-","-"],                
                ["-","-","-","-","-","-","-","-","-"]]


        return grid, cages

    def constructCages(self):
        '''
        Constructs the cages found withing the puzzle. 

        Returns:
        A dictionary with the key being the cage number, the value is 
        another dictionary with the sum being the key and the value
        being an array containing the cage cells. 
        '''
        cages = {}
        counter = 0
        for i in range(len(self.cages)):
            for j in range(len(self.cages[i])):
                if self.cages[i][j][5] != 1:
                    cells = self.constructCage(i, j)
                    cages[counter] = {self.cages[i][j][0] : cells}
                    counter += 1
        return cages


    def constructCage(self, i, j):
        '''
        A recusive algorithm to find all the cells which are in the same cage.

        Parameters:
        i - the row of the cell
        j - the column of the cell

        Returns:
        An array containing the cells in the same cage.
        '''
        cageCells = [(i, j)]
        cell = self.cages[i][j]
        if cell[5] == 1:
            return []
        self.cages[i][j][5] = 1
        if cell[2] == 0:
            cageCells = cageCells + self.constructCage(i+1, j)
        if cell[3] == 0:
            cageCells = cageCells + self.constructCage(i, j+1)
        if cell[1] == 0:
            cageCells = cageCells + self.constructCage(i, j-1)
        return cageCells
        



    def getPuzzle(self, cells, cageSums):
        '''
        Determines the cage borders for each cell as well as if it contains
        the cage sum.

        Parameters:
        cells - all 81 images of cells, one for each cell
        cageSums - the images of the top left of the cell where the cage sum is usually located.

        Returns:
        A 2D array containing a sub array in the format, cageSum (-1 if not cageSum),
        left, bottom, right and checked 
        '''
        grid = []
        for i in range(len(cells)):
            current_cell = [0,0,0,0,0,0]
            cell_sum = self.isCageSumCell(cageSums[i])
            if cell_sum == -1:
                current_cell[0] = -1
            else:
                current_cell[0] = cell_sum
                current_cell[1], current_cell[4] = 1, 1

            sides = self.getCageSides(cells[i])
            for j in range(len(sides)):
                if sides[j] > 5:
                    current_cell[j+1] = 1
            grid.append(current_cell)
        return grid



    def getCageSides(self, cell):
        '''
        Determines which side the borders of the cage is in the cell.

        Parameters:
        cell - the cell to be checked.

        Returns:
        An array in the format left, bottom, right, and top
        each index with the number of contours found on that side.
        '''

        margin = 20
        #left, bottom, right, top
        sides = [0, 0, 0, 0] 
        block = cv2.detailEnhance(cell, sigma_s=15, sigma_r=0.1)
        se = cv2.getStructuringElement(cv2.MORPH_RECT, (4,4))
        bg = cv2.morphologyEx(block, cv2.MORPH_DILATE, se)
        out_gray = cv2.divide(block, bg, scale=255)

        # Convert out_gray to grayscale
        out_gray = cv2.cvtColor(out_gray, cv2.COLOR_BGR2GRAY)
        out_binary = cv2.threshold(out_gray, 0, 255, cv2.THRESH_OTSU)[1]
        contours, hierarchy = cv2.findContours(out_binary.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE) 
        
        for contour in contours:
            # get the bounding rectangle of the contour
            x, y, w, h = cv2.boundingRect(contour)

            # calculate the center of the bounding rectangle
            center_x = x + w // 2
            center_y = y + h // 2
            
            # check if the center is within the specified margin of the sides
            if center_x < margin and x > 2:
                sides[0] += 1
            elif center_x > 110 - margin and x + w < 108:
                sides[2] += 1
            
            if center_y < margin and y > 2:
                sides[3] += 1
            elif center_y > 110 - margin and y + h < 108:
                sides[1] += 1

        return sides

        


    def isCageSumCell(self, cell):
        '''
        Checks whether the cell contains the sum of the cage.

        parameters:
        cell - the cell to be checked.

        Returns: 
        The cage sum if it exists or -1 otherwise.
        '''

        # improving the image resolution
        se = cv2.getStructuringElement(cv2.MORPH_RECT, (6,6))
        bg = cv2.morphologyEx(cell, cv2.MORPH_DILATE, se)
        out_gray = cv2.divide(cell, bg, scale=255)

        # Convert out_gray to grayscale
        out_gray = cv2.cvtColor(out_gray, cv2.COLOR_BGR2GRAY)
        out_binary = cv2.threshold(out_gray, 0, 255, cv2.THRESH_OTSU)[1]
        canny = cv2.Canny(out_binary, 100, 255, 1)
        contours, hierarchy = cv2.findContours(canny.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        sorted_contours = sorted(contours, key=lambda x: cv2.boundingRect(x)[2] * cv2.boundingRect(x)[3], reverse=True)
        sums = []
        can = np.ones((40,40)) * 255

        # getting the 2 largest contours in the case of double digit numbers
        for j in range(len(sorted_contours)):
            x, y, w, h = cv2.boundingRect(sorted_contours[j])
            roi = out_gray[y:y+h, x:x+w]
            canvas = np.zeros_like(roi)
            canvas[:h, :w] = roi
            # filtering contours with are not digits
            if h*w < 1000 and h < 35 and h > 15 and w < 25 and w > 5:
                #can = cv2.drawContours(can, sorted_contours, j, (0,0,0), 1)
                #cv2.imshow("image", can)
                #cv2.waitKey()
                #cv2.destroyAllWindows()
                if len(sums) == 0:
                    sums.append(canvas)
                    current_x = x
                else:
                    if x < current_x:
                        sums.insert(0, canvas)
                    else:
                        sums.append(canvas)

        if len(sums) == 0:
            return -1
        
        # returning the number
        cageSum = self.digitRecognition.ConvertToDigit(sums)
        cageSum = ''.join(map(str, cageSum))
        return int(cageSum) 
            

    def isCentered(self, x1, y1, w1, h1):
        '''
        Checking if the given contour is centered or not

        Parameters:
        x1 - x coordinate of contour
        y1 - y cooridnate of contour
        w1 - width of the contour
        h1 - hight of the contour

        Returns:
        True if centered false otherwise.
        '''

        # defining the center to be 15 x 15
        x2, y2, w2, h2 = 15, 5, 30, 10

        # Calculate the right and bottom coordinates of each rectangle
        right1, bottom1 = y1 + w1, x1 + h1
        right2, bottom2 = y2 + w2, x2 + h2

        # Checking if there is an overlap
        if (x1 > right2) or (x2 > right1):
            return False 
        if (y1 > bottom2) or (y2 > bottom1):
            return False

        return True


    def straightenImage(self, edges):
        '''
        Givens the corners of the puzzle, it resizes the puzzle as need to fit in a 
        450x450 box. 

        Parameters:
        processedImage - A grayscale image 
        edges - an array containing the edge points of the puzzle.

        Returns:
        An image which has been straightened.
        '''

        # getting the array in the correct format.
        image = self.image
        
        if image.shape[0] > 1000 and image.shape[1] > 1000:
            image = self.extraction.resizeImage(image)

        edgePoints = np.zeros((4, 1, 2), dtype=np.float32)
        for i in range(4):
            edgePoints[i][0] = edges[i]

        # creating a 990 by 990 template image
        dst = np.array([[0, 0], [990, 0], [990, 990], [0, 990]], dtype='float32')

        # Calculate the perspective transformation matrix
        M = cv2.getPerspectiveTransform(edgePoints, dst)

        image = cv2.warpPerspective(image, M, (990, 990))

        return image
    


    def cellExtraction(self, original):   
        '''
        Extracts all the cells from the image 

        Parameters:
        image - A straighted image of the puzzle

        Returns:
        An array containing the cells in the image.
        '''

        # defining the height and width for each cell      
        cell_height = 990 // 9
        cell_width = 990 // 9
        cells = []
        original_cells = []

        # Loop through each cell in the image.
        for y in range(0, 990, cell_height):
            for x in range(0, 990, cell_width):
                # Get each 110x110 block from the image
                block = original[y:y+cell_height, x:x+cell_width]
                
                # Append the extracted block to the cells array
                cells.append(block)

                original_cells.append(original[y:y+40, x+5:x+45])

        return cells, original_cells