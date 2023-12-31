import heapq
import itertools

class KillerSudokuHeap:
    '''
    This class is an implementation of a priority queue 
    to order the cells in order of the smallest domain first.
    '''

    def __init__(self):
        '''
        constructor for the queue and initialises the required values.
        '''
        self.pq = []
        self.key_map = {} 
        self.REMOVED = '<removed-task>'  
        self.counter = itertools.count() 

    

    def addToHeap(self, item):
        '''
        Takes a cell and pushes it into the priority queue to be ordered.

        parameters:
        A tuple containing:
        - the length of the domain
        - A tuple containing the row and column
        - A set containing all the values in the domain
        '''

        if item[1] in self.key_map:
            self.remove_cell(item)
        count = next(self.counter)
        entry = [item[0], count, item[1], item[2], "available"]
        self.key_map[item[1]] = entry
        heapq.heappush(self.pq, entry)



    def remove_cell(self, task):
        '''
        Sets the given task to removed. The cell is not removed it is simple ignored. 

        parameters:
        A tuple containing:
        - the length of the domain
        - A tuple containing the row and column
        - A set containing all the values in the domain
        '''
        entry = self.key_map.pop(task[1])
        entry[-1] = self.REMOVED



    def pop_cell(self):
        '''
        Returns the cell which contains the smallest domain.

        Returns:
        The length of the array, count, the cell and its domain.
        If the queue us empty it returns None fot all. 
        '''
        while self.pq:
            priority, count, cell, domain, status = heapq.heappop(self.pq)
            if status is not self.REMOVED:
                del self.key_map[cell]
                return priority, cell, domain
        return None, None, None
    


    def decreaseCageKey(self, cell, domain):
        '''
        Goes through all the cells in the given cells row, column and 3x3 box and
        updates them if the values assigned is contained in their domain.

        Parameters:
        The row, column and the value that was assigned.

        Returns:
        An array containing tuples with the row, column and value of the cells which were updated.
        '''
        item = self.key_map[cell]
        if len(item[3]) != len(domain):
            self.addToHeap((len(domain), cell, domain))
            return (item[0], item[2], item[3])
        return None
    

    def decreaseNonCageKey(self, cell, val):
        '''
        Goes through all the cells in the given cells row, column and 3x3 box and
        updates them if the values assigned is contained in their domain.

        Parameters:
        The row, column and the value that was assigned.

        Returns:
        An array containing tuples with the row, column and value of the cells which were updated.
        '''
        item = self.key_map[cell]
        if val in item[3]:
            m_set = item[3].copy()
            m_set.remove(val)
            self.addToHeap((len(m_set), cell, m_set))
            return (len(m_set) + 1, cell, item[3])
        return None

        


    def increaseKey(self, updatedCells):
        '''
        Goes through all the cells which were changed and reverts their change.

        Parameters:
        An array containing tuples with the row, col and value which was removed.
        '''
        for updated in updatedCells:
            self.addToHeap((updated[0], updated[1], updated[2]))
